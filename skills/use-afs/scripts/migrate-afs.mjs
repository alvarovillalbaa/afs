#!/usr/bin/env node
import { appendFile, mkdir, readFile, readdir, rename, rmdir, unlink, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { rootTemplates, safePath, resolveWorkspace } from "./standard.mjs"

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex")
const decode = (bytes) => new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)

function uniqueDestination(destination, reserved) {
  if (!existsSync(destination) && !reserved.has(destination)) { reserved.add(destination); return destination }
  const parsed = path.parse(destination)
  for (let index = 1; index < 1000; index++) {
    const suffix = index === 1 ? "-migrated" : `-migrated-${index}`
    const candidate = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`)
    if (!existsSync(candidate) && !reserved.has(candidate)) { reserved.add(candidate); return candidate }
  }
  throw new Error(`No non-conflicting destination for ${destination}`)
}

async function files(root, instructionRoot, scan = false, blockers = []) {
  const info = await safePath(instructionRoot, root)
  if (!info) return []
  if (!info.isDirectory()) throw new Error(`Expected directory: ${root}`)
  const result = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (scan && [".git", "node_modules", ".next", ".venv", "skills"].includes(entry.name)) continue
    const current = path.join(root, entry.name)
    if (entry.isSymbolicLink()) {
      if (!scan) blockers.push(`${current} is a symlink; its owner must migrate it.`)
    } else if (entry.isDirectory()) result.push(...await files(current, instructionRoot, scan, blockers))
    else if (entry.isFile()) result.push(current)
  }
  return result
}

function rebase(text, source, destination, mappings) {
  const rewrite = (match, before, url, title = "", after) => {
    const angle = url.startsWith("<")
    const value = angle ? url.slice(1, -1) : url
    if (/^(?:[a-z]+:|\/)/i.test(value)) return match
    const separator = value.indexOf("#")
    const pathname = separator < 0 ? value : value.slice(0, separator)
    const fragment = separator < 0 ? "" : value.slice(separator + 1)
    let decodedPath
    try { decodedPath = decodeURIComponent(pathname) } catch { decodedPath = pathname }
    const oldTarget = pathname ? path.resolve(path.dirname(source), decodedPath) : source
    const mapped = mappings.get(oldTarget)
    if (!mapped && source === destination) return match
    const newTarget = mapped?.destination ?? oldTarget
    const relative = path.relative(path.dirname(destination), newTarget).split(path.sep).join("/") || path.basename(destination)
    const anchor = mapped?.anchor ? `${mapped.anchor}${fragment ? `-${fragment}` : ""}` : fragment
    const result = `${encodeURI(relative)}${anchor ? `#${anchor}` : ""}`
    return `${before}${angle ? `<${result}>` : result}${title}${after}`
  }
  return text
    .replace(/(!?\[[^\]\n]*\]\()(<[^>\n]+>|[^\s()]+)([ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^\)\n]*\)))?(\))/g, rewrite)
    .replace(/^([ ]{0,3}\[[^\]\n]+\]:[ \t]*(?:\r?\n[ \t]*)?)(<[^>\n]+>|[^\s]+)([ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^\)\n]*\)))?([ \t]*\r?$)/gm, rewrite)
}

function headingAnchors(text, anchor) {
  const counts = new Map()
  let fence = ""
  const lines = text.split("\n")
  return lines.map((line, index) => {
    const fenced = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenced) { fence = fence === fenced[1][0] ? "" : fence || fenced[1][0]; return line }
    if (fence) return line
    const heading = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/) ??
      (line.trim() && /^ {0,3}(?:=+|-+)\s*$/.test(lines[index + 1] ?? "") ? [line, line.trim()] : null)
    if (!heading) return line
    const slug = heading[1].toLowerCase().replace(/!?\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]*>/g, "").replace(/[^\p{L}\p{N}_\-\s]/gu, "").replace(/\s/g, "-")
    const count = counts.get(slug) ?? 0
    counts.set(slug, count + 1)
    return `<a id="${anchor}-${slug}${count ? `-${count}` : ""}"></a>\n${line}`
  }).join("\n")
}

async function main() {
  const args = process.argv.slice(2)
  const { target, instructionRoot, profile } = resolveWorkspace(args.find((arg) => !arg.startsWith("--")), args.find((arg) => arg.startsWith("--mode="))?.slice(7))
  await safePath(instructionRoot, target)
  const profilePath = path.join(instructionRoot, ".afs-profile.json")
  const profileInfo = await safePath(instructionRoot, profilePath)
  if (profileInfo) {
    if (!profileInfo.isFile()) throw new Error("AFS profile marker must be a regular file")
    const saved = JSON.parse(await readFile(profilePath, "utf8"))
    if (saved.version !== 1 || saved.profile !== profile) throw new Error("Existing AFS profile differs; review placement before migration")
  } else if (profile === "docs") {
    // Retiring legacy root documents must not erase the selected workspace.
    await writeFile(profilePath, JSON.stringify({ version: 1, profile }) + "\n", { flag: "wx" })
  }
  const mappings = new Map()
  const jobs = []
  const directoryJobs = []
  const blockers = []
  const selectedRegistries = new Set(args.filter((arg) => arg.startsWith("--registry=")).map((arg) => path.resolve(instructionRoot, arg.slice(11))))
  const seenRegistries = new Set()
  const date = new Date().toISOString().slice(0, 10)
  const owner = (source, destination) => ({ destination, anchor: `afs-migrated-${hash(path.relative(instructionRoot, source)).slice(0, 20)}` })
  const dated = `${date.slice(0, 4)}/${date.slice(5)}`
  const visionOption = args.find((arg) => arg.startsWith("--vision-owner="))?.split("=")[1]
  if (visionOption && !["COMPANY.md", "PRODUCT.md", "ICP.md"].includes(visionOption)) throw new Error("--vision-owner must be COMPANY.md, PRODUCT.md, or ICP.md")
  const rootOwners = {
    "BRAIN.md": path.join(instructionRoot, "AGENTS.md"),
    "FOCUS.md": path.join(instructionRoot, "ROADMAP.md"),
    "FRICTION.md": path.join(target, "logs", dated, "friction-history.md"),
    "REGRESSIONS.md": path.join(target, "fixes", dated, "regression-history.md"),
    "DECISIONS.md": path.join(target, "decisions", "prior-decisions.md"),
    "RUNBOOK.md": path.join(target, "runbooks", "prior-operations.md"),
  }
  if (visionOption) rootOwners["VISION.md"] = path.join(instructionRoot, visionOption)
  for (const root of new Set([instructionRoot, target])) {
    for (const [name, destination] of Object.entries(rootOwners)) {
      const source = path.join(root, name)
      try {
        if (await safePath(instructionRoot, source)) { mappings.set(source, owner(source, destination)); jobs.push({ source, destination }) }
      } catch (error) { blockers.push(error.message) }
    }
    if (!visionOption && existsSync(path.join(root, "VISION.md"))) blockers.push("VISION.md needs --vision-owner=COMPANY.md, PRODUCT.md, or ICP.md after scope review.")
    if (existsSync(path.join(root, "PREDICTION.md"))) blockers.push("PREDICTION.md needs a relevant research unit, plan, spec, or roadmap owner after content review.")
  }
  if (profile === "docs") {
    for (const name of rootTemplates) {
      const source = path.join(target, name)
      const destination = path.join(instructionRoot, name)
      try {
        if (await safePath(instructionRoot, source)) { mappings.set(source, owner(source, destination)); jobs.push({ source, destination }) }
      } catch (error) { blockers.push(error.message) }
    }
  }
  for (const [dir, registry] of [["references", "REFERENCES.md"], ["sources", "SOURCES.md"]]) {
    let entries
    try { entries = await files(path.join(target, dir), instructionRoot, false, blockers) }
    catch (error) { blockers.push(error.message); continue }
    for (const source of entries) {
      if (!selectedRegistries.has(source)) { blockers.push(`${path.relative(instructionRoot, source)} is retained; select a reviewed registry with --registry, or verify external preservation for a source artifact.`); continue }
      seenRegistries.add(source)
      if (!source.endsWith(".md")) { blockers.push(`${path.relative(target, source)} needs a verified Drive export before removal.`); continue }
      const destination = path.join(instructionRoot, registry)
      mappings.set(source, owner(source, destination))
      jobs.push({ source, destination })
    }
  }
  for (const source of selectedRegistries) {
    if (!seenRegistries.has(source)) throw new Error(`Registry selection is outside the detected registry trees or is not a regular file: ${source}`)
  }
  // Resolve actual conflict destinations before rewriting any referring text.
  const reserved = new Set(jobs.map((job) => job.destination))
  for (const [sourcePath, destinationPath] of [["cookbook", "cookbooks"], ["items", "facts/general"], ["models/decisions", "decisions"], ["models/problems", "problems"]]) {
    const sourceRoot = path.join(target, sourcePath)
    const destinationRoot = path.join(target, destinationPath)
    try {
      const info = await safePath(instructionRoot, sourceRoot)
      if (!info) continue
      if (!info.isDirectory()) throw new Error(`Expected directory: ${sourceRoot}`)
      await safePath(instructionRoot, destinationRoot)
      for (const name of await readdir(sourceRoot)) {
        const source = path.join(sourceRoot, name)
        try {
          const info = await safePath(instructionRoot, source)
          const before = blockers.length
          const paths = info.isDirectory() ? await files(source, instructionRoot, false, blockers) : [source]
          if (blockers.length !== before) continue
          const destination = uniqueDestination(path.join(destinationRoot, name), reserved)
          await safePath(instructionRoot, destination)
          const markdown = []
          for (const file of paths) if (file.endsWith(".md")) {
            const bytes = await readFile(file)
            markdown.push({ file, text: decode(bytes), sha256: hash(bytes) })
          }
          directoryJobs.push({ source, destination, markdown })
          for (const file of [source, ...paths]) {
            let current = file
            while (current !== sourceRoot) {
              mappings.set(current, { destination: path.join(destination, path.relative(source, current)) })
              if (current === source) break
              current = path.dirname(current)
            }
          }
        } catch (error) { blockers.push(`${source}: ${error.message}`) }
      }
    } catch (error) { blockers.push(error.message) }
  }
  // Preflight every text job before using its mapping in another file.
  const admittedJobs = []
  for (const job of jobs) {
    try {
      if (!(await safePath(instructionRoot, job.source)).isFile()) throw new Error(`Source is not a regular file: ${job.source}`)
      const destination = await safePath(instructionRoot, job.destination)
      if (destination && !destination.isFile()) throw new Error(`Destination is not a regular file: ${job.destination}`)
      job.bytes = await readFile(job.source)
      job.text = decode(job.bytes)
      if (destination) decode(await readFile(job.destination))
      admittedJobs.push(job)
    } catch (error) {
      blockers.push(`${path.relative(instructionRoot, job.source)}: ${error.message}`)
      mappings.delete(job.source)
    }
  }
  for (const registry of ["REFERENCES.md", "SOURCES.md"]) {
    try {
      const destination = path.join(instructionRoot, registry)
      if (!await safePath(instructionRoot, destination)) await writeFile(destination, `# ${registry.slice(0, -3)}\n`, { flag: "wx" })
    } catch (error) { blockers.push(error.message) }
  }
  for (const job of admittedJobs) {
    await safePath(instructionRoot, job.source)
    await safePath(instructionRoot, job.destination)
    if (hash(await readFile(job.source)) !== hash(job.bytes)) throw new Error(`Source changed during migration: ${job.source}`)
    await mkdir(path.dirname(job.destination), { recursive: true })
    if (!await safePath(instructionRoot, job.destination)) await writeFile(job.destination, `# ${path.basename(job.destination, ".md")}\n`, { flag: "wx" })
    const origin = path.relative(instructionRoot, job.source)
    const marker = `<!-- afs-migration:${hash(origin + "\0" + hash(job.bytes))} -->`
    const anchor = mappings.get(job.source).anchor
    const section = `\n\n${marker}\n<a id="${anchor}"></a>\n## Migrated context: ${origin}\n\nOriginal content retained for review. Current AFS routing supersedes any retired paths below.\n\n${headingAnchors(rebase(job.text, job.source, job.destination, mappings), anchor)}\n<!-- /afs-migration -->\n`
    const existing = decode(await readFile(job.destination))
    if (existing.includes(`<a id="${anchor}"></a>`) && !existing.includes(marker)) throw new Error(`Changed migration source; preserve both versions for review: ${job.source}`)
    if (existing.includes(marker) && !existing.includes(section)) throw new Error(`Partial or changed migration entry; source retained for review: ${job.destination}`)
    if (!existing.includes(section)) {
      await safePath(instructionRoot, job.destination)
      await appendFile(job.destination, section)
      if (!(await readFile(job.destination, "utf8")).endsWith(section)) throw new Error("Migration append verification failed; source retained")
    }
    await safePath(instructionRoot, job.source)
    if (hash(await readFile(job.source)) !== hash(job.bytes)) throw new Error(`Source changed before retirement: ${job.source}`)
    await unlink(job.source)
    console.log(`${origin} -> ${path.relative(instructionRoot, job.destination)}`)
  }
  for (const job of directoryJobs) {
    await safePath(instructionRoot, job.source)
    if ((await safePath(instructionRoot, job.source)).isDirectory()) {
      const before = blockers.length
      await files(job.source, instructionRoot, false, blockers)
      if (blockers.length !== before) throw new Error(`Directory changed during migration: ${job.source}`)
    }
    for (const item of job.markdown) if (hash(await readFile(item.file)) !== item.sha256) throw new Error(`Source changed during migration: ${item.file}`)
    if (await safePath(instructionRoot, job.destination)) throw new Error(`Destination appeared during migration: ${job.destination}`)
    await mkdir(path.dirname(job.destination), { recursive: true })
    await rename(job.source, job.destination)
    for (const item of job.markdown) {
      const destination = mappings.get(item.file).destination
      await safePath(instructionRoot, destination)
      const updated = rebase(item.text, item.file, destination, mappings)
      if (updated !== item.text) await writeFile(destination, updated)
    }
    console.log(`${path.relative(target, job.source)} -> ${path.relative(target, job.destination)}`)
  }
  for (const file of await files(instructionRoot, instructionRoot, true)) {
    if (!file.endsWith(".md")) continue
    let original
    try { original = decode(await readFile(file)) }
    catch (error) { blockers.push(`${path.relative(instructionRoot, file)}: ${error.message}`); continue }
    const updated = rebase(original, file, file, mappings)
    if (updated !== original) { await safePath(instructionRoot, file); await writeFile(file, updated) }
  }
  async function removeEmpty(root) {
    if (!await safePath(instructionRoot, root)) return
    for (const entry of await readdir(root, { withFileTypes: true })) if (entry.isDirectory()) await removeEmpty(path.join(root, entry.name))
    if ((await readdir(root)).length === 0) await rmdir(root)
  }
  for (const dir of ["references", "sources", "models", "items", "cookbook"]) {
    try { await removeEmpty(path.join(target, dir)) } catch (error) { blockers.push(error.message) }
  }
  for (const dir of ["raw", "official-documentation", "goals", "models/goals", "templates", "facts/items", "facts/episodes", "facts/triples"]) {
    if (existsSync(path.join(target, dir))) blockers.push(`${dir}/ requires verified external preservation or an explicit content owner; it has been preserved.`)
  }
  if (blockers.length) {
    for (const blocker of blockers) console.error(`Blocked: ${blocker}`)
    process.exitCode = 2
  } else console.log("Migration finished. Review retained context and validate the complete workspace.")
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })

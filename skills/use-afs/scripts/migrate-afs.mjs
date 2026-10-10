#!/usr/bin/env node
import { appendFile, lstat, mkdir, readFile, readdir, rename, rmdir, unlink, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { resolveWorkspace } from "./standard.mjs"

function uniqueDestination(destination) {
  if (!existsSync(destination)) return destination
  const parsed = path.parse(destination)
  for (let index = 1; index < 1000; index++) {
    const suffix = index === 1 ? "-migrated" : `-migrated-${index}`
    const candidate = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`)
    if (!existsSync(candidate)) return candidate
  }
  throw new Error(`No non-conflicting destination for ${destination}`)
}

async function files(root) {
  if (!existsSync(root)) return []
  const result = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if ([".git", "node_modules", ".next", ".venv", "skills"].includes(entry.name)) continue
    const current = path.join(root, entry.name)
    if (entry.isDirectory()) result.push(...await files(current))
    else if (entry.isFile()) result.push(current)
  }
  return result
}

function rebase(text, source, destination, mappings) {
  return text.replace(/(!?\[[^\]]*\]\()([^\s()]+)(\))/g, (match, before, url, after) => {
    if (/^(?:[a-z]+:|#|\/)/i.test(url)) return match
    const [pathname, fragment] = url.split("#")
    const oldTarget = path.resolve(path.dirname(source), pathname)
    const newTarget = mappings.get(oldTarget) ?? oldTarget
    const relative = path.relative(path.dirname(destination), newTarget).split(path.sep).join("/") || path.basename(destination)
    return `${before}${relative}${fragment ? `#${fragment}` : ""}${after}`
  })
}

async function main() {
  const args = process.argv.slice(2)
  const { target, instructionRoot } = resolveWorkspace(args.find((arg) => !arg.startsWith("--")))
  const mappings = new Map()
  const jobs = []
  const blockers = []
  const date = new Date().toISOString().slice(0, 10)
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
      if (existsSync(source)) { mappings.set(source, destination); jobs.push({ source, destination }) }
    }
    if (!visionOption && existsSync(path.join(root, "VISION.md"))) blockers.push("VISION.md needs --vision-owner=COMPANY.md, PRODUCT.md, or ICP.md after scope review.")
    if (existsSync(path.join(root, "PREDICTION.md"))) blockers.push("PREDICTION.md needs a relevant research unit, plan, spec, or roadmap owner after content review.")
  }
  for (const [dir, registry] of [["references", "REFERENCES.md"], ["sources", "SOURCES.md"]]) {
    for (const source of await files(path.join(target, dir))) {
      if (!source.endsWith(".md")) { blockers.push(`${path.relative(target, source)} needs a verified Drive export before removal.`); continue }
      const destination = path.join(instructionRoot, registry)
      mappings.set(source, destination)
      jobs.push({ source, destination })
    }
  }
  for (const job of jobs) {
    if ((await lstat(job.source)).isSymbolicLink() || (existsSync(job.destination) && (await lstat(job.destination)).isSymbolicLink())) {
      blockers.push(`${path.relative(instructionRoot, job.source)} has a symlink source or destination; its source owner must migrate it.`)
      mappings.delete(job.source)
      continue
    }
    const text = await readFile(job.source, "utf8")
    await mkdir(path.dirname(job.destination), { recursive: true })
    if (!existsSync(job.destination)) await writeFile(job.destination, `# ${path.basename(job.destination, ".md")}\n`)
    const origin = path.relative(instructionRoot, job.source)
    await appendFile(job.destination, `\n\n## Migrated context: ${origin}\n\nOriginal content retained for review. Current AFS routing supersedes any retired paths below.\n\n${rebase(text, job.source, job.destination, mappings)}`)
    await unlink(job.source)
    console.log(`${origin} -> ${path.relative(instructionRoot, job.destination)}`)
  }
  for (const [sourcePath, destinationPath] of [["cookbook", "cookbooks"], ["items", "facts/general"], ["models/decisions", "decisions"], ["models/problems", "problems"]]) {
    const sourceRoot = path.join(target, sourcePath)
    if (!existsSync(sourceRoot)) continue
    await mkdir(path.join(target, destinationPath), { recursive: true })
    for (const entry of await readdir(sourceRoot)) {
      const source = path.join(sourceRoot, entry)
      const destination = uniqueDestination(path.join(target, destinationPath, entry))
      await rename(source, destination)
      console.log(`${sourcePath}/${entry} -> ${path.relative(target, destination)}`)
    }
    await rmdir(sourceRoot)
  }
  for (const file of await files(instructionRoot)) {
    if (!file.endsWith(".md")) continue
    const original = await readFile(file, "utf8")
    const updated = rebase(original, file, file, mappings)
    if (updated !== original) await writeFile(file, updated)
  }
  async function removeEmpty(root) {
    if (!existsSync(root)) return
    for (const entry of await readdir(root, { withFileTypes: true })) if (entry.isDirectory()) await removeEmpty(path.join(root, entry.name))
    if ((await readdir(root)).length === 0) await rmdir(root)
  }
  for (const dir of ["references", "sources", "models"]) await removeEmpty(path.join(target, dir))
  for (const dir of ["raw", "official-documentation", "goals", "models/goals", "templates"]) {
    if (existsSync(path.join(target, dir))) blockers.push(`${dir}/ requires verified external preservation or an explicit content owner; it has been preserved.`)
  }
  if (blockers.length) {
    for (const blocker of blockers) console.error(`Blocked: ${blocker}`)
    process.exitCode = 2
  } else console.log("Migration finished. Review retained context and validate the complete workspace.")
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })

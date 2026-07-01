#!/usr/bin/env node
import { readdir, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const contextMaxBytes = 20_000

const rootStyleMarkdown = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  "USER.md",
  "BRAIN.md",
  "MEMORY.md",
  "PLAYBOOK.md",
  "PLAN.md",
  "SPEC.md",
  "SOUL.md",
  "DESIGN.md",
  "PRODUCT.md",
  "COMPANY.md",
  "VALUES.md",
  "ICP.md",
  "VOICE.md",
  "FRICTION.md",
  "PREDICTION.md",
  "REGRESSIONS.md",
  "HEARTBEAT.md",
  "VISION.md",
  "LOOPS.md",
  "TASTE.md",
  "GAPS.md",
])

const recommendedRootFiles = [
  "AGENTS.md",
  "BRAIN.md",
  "VISION.md",
  "LOOPS.md",
  "TASTE.md",
  "GAPS.md",
]

const recommendedWorkspaceFiles = [
  "knowledge/INDEX.md",
  "raw/PROCESSED.md",
  "raw/UNPROCESSED.md",
  "sources/INDEX.md",
  "facts/INDEX.md",
  "facts/items/general/INDEX.md",
  "facts/episodes/general/INDEX.md",
  "facts/triples/general/INDEX.md",
  "models/decisions/INDEX.md",
  "models/problems/INDEX.md",
  "models/goals/INDEX.md",
  "cookbooks/INDEX.md",
  "templates/INDEX.md",
]

const recommendedWorkspaceDirs = [
  "logs",
  "lessons",
  "facts",
  "fixes",
  "steers",
  "models",
  "reflections",
  "audits",
  "raw",
  "plans",
  "specs",
  "lib",
  "objects",
  "templates",
  "results",
  "references",
  "cookbooks",
  "knowledge",
  "runbooks",
  "research",
]

const timestampedRoots = [
  "logs",
  "fixes",
  "steers",
  "reflections",
  "audits",
  "plans",
  "results",
]

const ignoredRootMarkdown = new Set(["README.md", "INDEX.md"])

function resolveValidationRoot(input) {
  const target = path.resolve(process.cwd(), input ?? ".")

  if (
    !existsSync(path.join(target, "BRAIN.md")) &&
    existsSync(path.join(target, "docs", "BRAIN.md"))
  ) {
    return {
      target: path.join(target, "docs"),
      originalTarget: target,
      profile: "docs",
    }
  }

  return {
    target,
    originalTarget: target,
    profile: "root",
  }
}

async function walkMarkdown(root) {
  if (!existsSync(root)) {
    return []
  }

  const results = []
  const entries = await readdir(root, { withFileTypes: true })

  for (const entry of entries) {
    const current = path.join(root, entry.name)

    if (entry.isDirectory()) {
      results.push(...(await walkMarkdown(current)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(current)
    }
  }

  return results
}

async function directMarkdownFiles(directory) {
  if (!existsSync(directory)) {
    return []
  }

  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        !ignoredRootMarkdown.has(entry.name)
    )
    .map((entry) => path.join(directory, entry.name))
}

async function warnDirectTimestampMarkdown(root, warnings) {
  for (const timestampedRoot of timestampedRoots) {
    const files = await directMarkdownFiles(path.join(root, timestampedRoot))

    for (const file of files) {
      warnings.push(
        `${path.relative(root, file)} should be under ${timestampedRoot}/YYYY/MM-DD/.`
      )
    }
  }

  const lessonsRoot = path.join(root, "lessons")
  const lessonRootFiles = await directMarkdownFiles(lessonsRoot)

  for (const file of lessonRootFiles) {
    warnings.push(
      `${path.relative(root, file)} should be under lessons/<domain>/YYYY/MM-DD/.`
    )
  }

  if (!existsSync(lessonsRoot)) {
    return
  }

  const lessonEntries = await readdir(lessonsRoot, { withFileTypes: true })

  for (const entry of lessonEntries) {
    if (!entry.isDirectory()) {
      continue
    }

    const domainRoot = path.join(lessonsRoot, entry.name)
    const files = await directMarkdownFiles(domainRoot)

    for (const file of files) {
      warnings.push(
        `${path.relative(root, file)} should be under lessons/${entry.name}/YYYY/MM-DD/.`
      )
    }
  }
}

async function findDomainFirstFacts(root) {
  const factsRoot = path.join(root, "facts")

  if (!existsSync(factsRoot)) {
    return []
  }

  const factTypes = new Set(["items", "episodes", "triples"])
  const matches = []
  const domainEntries = await readdir(factsRoot, { withFileTypes: true })

  for (const domainEntry of domainEntries) {
    if (!domainEntry.isDirectory() || factTypes.has(domainEntry.name)) {
      continue
    }

    const domainRoot = path.join(factsRoot, domainEntry.name)
    const typeEntries = await readdir(domainRoot, { withFileTypes: true })
    let foundTypeDirectory = false

    for (const typeEntry of typeEntries) {
      if (typeEntry.isDirectory() && factTypes.has(typeEntry.name)) {
        foundTypeDirectory = true
        matches.push(`facts/${domainEntry.name}/${typeEntry.name}`)
      }
    }

    if (!foundTypeDirectory && typeEntries.length > 0) {
      matches.push(`facts/${domainEntry.name}`)
    }
  }

  return matches
}

async function main() {
  const validation = resolveValidationRoot(process.argv[2])
  const target = validation.target
  const errors = []
  const warnings = []

  if (
    existsSync(path.join(target, "official-documentation")) ||
    existsSync(path.join(validation.originalTarget, "official-documentation"))
  ) {
    errors.push("Remove official-documentation/ and move its contents to sources/.")
  }

  if (existsSync(path.join(target, "items"))) {
    errors.push(
      "Remove top-level items/ and move its contents to facts/items/general/."
    )
  }

  if (existsSync(path.join(target, "cookbook"))) {
    errors.push("Remove cookbook/ and move its contents to cookbooks/.")
  }

  if (existsSync(path.join(target, "context"))) {
    warnings.push("context/ is a legacy path and is not an active AFS surface.")
  }

  if (!existsSync(path.join(target, "sources"))) {
    warnings.push("sources/ is missing.")
  }

  const domainFirstFacts = await findDomainFirstFacts(target)

  for (const legacyPath of domainFirstFacts) {
    errors.push(
      `Move ${legacyPath}/ to facts/<type>/<domain>/, for example facts/items/general/.`
    )
  }

  for (const file of recommendedRootFiles) {
    if (!existsSync(path.join(target, file))) {
      warnings.push(`${file} is recommended at the workspace root.`)
    }
  }

  for (const file of recommendedWorkspaceFiles) {
    if (!existsSync(path.join(target, file))) {
      warnings.push(`${file} is recommended in a complete AFS shell.`)
    }
  }

  for (const dir of recommendedWorkspaceDirs) {
    if (!existsSync(path.join(target, dir))) {
      warnings.push(`${dir}/ is recommended in a complete AFS shell.`)
    }
  }

  await warnDirectTimestampMarkdown(target, warnings)

  const contextMarkdown = await walkMarkdown(path.join(target, "context"))

  for (const file of contextMarkdown) {
    const name = path.basename(file)
    const relative = path.relative(target, file)
    const fileStats = await stat(file)

    if (rootStyleMarkdown.has(name)) {
      errors.push(`${relative} is a root-style Markdown file and must live at root.`)
    }

    if (fileStats.size > contextMaxBytes) {
      errors.push(
        `${relative} is ${fileStats.size} bytes. Keep large Markdown out of context/.`
      )
    }
  }

  if (warnings.length > 0) {
    console.log("AFS validation warnings:")
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }

  if (errors.length > 0) {
    console.error("AFS validation failed:")
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
    return
  }

  if (validation.profile === "docs") {
    console.log(`AFS validation profile: docs (${target})`)
  }

  console.log(`AFS validation passed: ${target}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

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
])

const recommendedRootFiles = [
  "AGENTS.md",
  "BRAIN.md",
  "VISION.md",
  "LOOPS.md",
  "TASTE.md",
]

const recommendedWorkspaceFiles = [
  "knowledge/INDEX.md",
  "raw/PROCESSED.md",
  "raw/UNPROCESSED.md",
  "sources/INDEX.md",
]

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

  if (!existsSync(path.join(target, "sources"))) {
    warnings.push("sources/ is missing.")
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

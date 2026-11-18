#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { removedDirs, removedRootFiles, resolveWorkspace, safePath, standardDirs } from "./standard.mjs"

async function main() {
  const args = process.argv.slice(2)
  const { target, instructionRoot, profile } = resolveWorkspace(args.find((arg) => !arg.startsWith("--")), args.find((arg) => arg.startsWith("--mode="))?.slice(7))
  await safePath(instructionRoot, target)
  const errors = []
  const warnings = []
  for (const dir of [...removedDirs, "official-documentation", "context", "items", "cookbook", "models/decisions"]) {
    if (existsSync(path.join(target, dir))) errors.push(`${dir}/ is a removed AFS surface; migrate its content without losing provenance.`)
  }
  for (const root of new Set([target, instructionRoot])) {
    if (existsSync(path.join(root, "official-documentation"))) errors.push(`${path.relative(instructionRoot, path.join(root, "official-documentation"))}/ is a removed AFS surface.`)
    for (const file of removedRootFiles) {
      if (existsSync(path.join(root, file))) errors.push(`${path.relative(instructionRoot, path.join(root, file))} must be consolidated into its current owner.`)
    }
  }
  for (const file of ["AGENTS.md", "REFERENCES.md", "SOURCES.md", "GAPS.md"]) {
    await safePath(instructionRoot, path.join(instructionRoot, file))
    if (!existsSync(path.join(instructionRoot, file))) errors.push(`${file} is required at the repository root.`)
  }
  async function checkLessons(root, parts = []) {
    if (!existsSync(root)) return
    await safePath(instructionRoot, root)
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const next = [...parts, entry.name]
      if (entry.isDirectory()) await checkLessons(path.join(root, entry.name), next)
      else if (entry.isFile() && entry.name.endsWith(".md") && !["README.md", "INDEX.md"].includes(entry.name) &&
          !(next.length >= 4 && /^\d{4}$/.test(next[1]) && /^\d{2}-\d{2}$/.test(next[2]))) {
        warnings.push(`lessons/${next.join("/")} should be under lessons/<domain>/YYYY/MM-DD/.`)
      }
    }
  }
  await checkLessons(path.join(target, "lessons"))
  for (const dir of standardDirs) {
    if (!existsSync(path.join(target, dir))) warnings.push(`${dir}/ is recommended in a complete AFS shell.`)
  }
  for (const dir of ["logs", "fixes", "steers", "reflections", "audits", "plans", "results"]) {
    if (!existsSync(path.join(target, dir))) continue
    for (const entry of await readdir(path.join(target, dir), { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md") && !["README.md", "INDEX.md"].includes(entry.name)) {
        warnings.push(`${dir}/${entry.name} should be under ${dir}/YYYY/MM-DD/.`)
      }
    }
  }
  const research = path.join(target, "research")
  if (existsSync(research)) {
    await safePath(instructionRoot, research)
    for (const entry of await readdir(research, { withFileTypes: true })) {
      if (!entry.isDirectory() && !["README.md", "INDEX.md"].includes(entry.name)) {
        errors.push(`research/${entry.name} must belong to a research unit folder.`)
      }
      if (!entry.isDirectory()) continue
      const definition = path.join(research, entry.name, "README.md")
      await safePath(instructionRoot, definition)
      if (!existsSync(definition)) {
        errors.push(`research/${entry.name}/README.md must define the research unit.`)
        continue
      }
      const text = await readFile(definition, "utf8")
      for (const heading of ["Questions and order", "Hypotheses", "Reasoning", "Method", "Evidence and status"]) {
        if (!text.includes(`## ${heading}`)) errors.push(`research/${entry.name}/README.md needs a ${heading} section.`)
      }
      if ((await stat(definition)).size === 0) errors.push(`${definition} is empty.`)
    }
  }
  for (const warning of warnings) console.log(`Warning: ${warning}`)
  if (errors.length) {
    for (const error of errors) console.error(`Error: ${error}`)
    process.exitCode = 1
  } else {
    console.log(`AFS validation passed (${profile}): ${target}`)
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })

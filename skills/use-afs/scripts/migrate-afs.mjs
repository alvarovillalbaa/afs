#!/usr/bin/env node
import { mkdir, readdir, rename, rmdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

function uniqueDestination(destination) {
  if (!existsSync(destination)) {
    return destination
  }

  const parsed = path.parse(destination)

  for (let index = 1; index < 1000; index += 1) {
    const suffix = index === 1 ? "-migrated" : `-migrated-${index}`
    const candidate = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`)

    if (!existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error(`Could not find non-conflicting destination for ${destination}`)
}

async function main() {
  const target = path.resolve(process.cwd(), process.argv[2] ?? ".")
  const oldDir = path.join(target, "official-documentation")
  const sourcesDir = path.join(target, "sources")

  if (!existsSync(oldDir)) {
    console.log("No official-documentation/ directory found. Nothing to migrate.")
    return
  }

  await mkdir(sourcesDir, { recursive: true })

  const entries = await readdir(oldDir)
  const moved = []

  for (const entry of entries) {
    const source = path.join(oldDir, entry)
    const destination = uniqueDestination(path.join(sourcesDir, entry))

    await rename(source, destination)
    moved.push(`${path.relative(target, source)} -> ${path.relative(target, destination)}`)
  }

  await rmdir(oldDir)

  if (moved.length === 0) {
    console.log("official-documentation/ was empty and has been removed.")
    return
  }

  console.log("Migrated AFS source material:")
  for (const item of moved) {
    console.log(`- ${item}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

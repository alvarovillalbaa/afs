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
  const moved = []
  const removed = []

  await migrateDirectory({
    target,
    sourcePath: "official-documentation",
    destinationPath: "sources",
    moved,
    removed,
  })
  await migrateDirectory({
    target,
    sourcePath: "items",
    destinationPath: "facts/items/general",
    moved,
    removed,
  })
  await migrateDirectory({
    target,
    sourcePath: "cookbook",
    destinationPath: "cookbooks",
    moved,
    removed,
  })
  await migrateDomainFirstFacts(target, moved, removed)

  if (moved.length === 0 && removed.length === 0) {
    console.log("No legacy AFS directories found. Nothing to migrate.")
    return
  }

  if (moved.length > 0) {
    console.log("Migrated AFS legacy material:")
    for (const item of moved) {
      console.log(`- ${item}`)
    }
  }

  if (removed.length > 0) {
    console.log("Removed empty legacy AFS directories:")
    for (const item of removed) {
      console.log(`- ${item}/`)
    }
  }
}

async function migrateDirectory({
  target,
  sourcePath,
  destinationPath,
  moved,
  removed,
}) {
  const oldDir = path.join(target, sourcePath)
  const newDir = path.join(target, destinationPath)

  if (!existsSync(oldDir)) {
    return
  }

  await mkdir(newDir, { recursive: true })

  const entries = await readdir(oldDir)

  for (const entry of entries) {
    const source = path.join(oldDir, entry)
    const destination = uniqueDestination(path.join(newDir, entry))

    await rename(source, destination)
    moved.push(
      `${path.relative(target, source)} -> ${path.relative(target, destination)}`
    )
  }

  await rmdir(oldDir)

  if (entries.length === 0) {
    removed.push(sourcePath)
  }
}

async function migrateDomainFirstFacts(target, moved, removed) {
  const factsRoot = path.join(target, "facts")

  if (!existsSync(factsRoot)) {
    return
  }

  const factTypes = new Set(["items", "episodes", "triples"])
  const domainEntries = await readdir(factsRoot, { withFileTypes: true })

  for (const domainEntry of domainEntries) {
    if (!domainEntry.isDirectory() || factTypes.has(domainEntry.name)) {
      continue
    }

    const domainPath = path.join(factsRoot, domainEntry.name)
    const typeEntries = await readdir(domainPath, { withFileTypes: true })

    for (const typeEntry of typeEntries) {
      if (!typeEntry.isDirectory() || !factTypes.has(typeEntry.name)) {
        continue
      }

      await migrateDirectory({
        target,
        sourcePath: path.join("facts", domainEntry.name, typeEntry.name),
        destinationPath: path.join("facts", typeEntry.name, domainEntry.name),
        moved,
        removed,
      })
    }

    await removeEmptyDirectory(target, path.join("facts", domainEntry.name), removed)
  }
}

async function removeEmptyDirectory(target, sourcePath, removed) {
  const directory = path.join(target, sourcePath)

  if (!existsSync(directory)) {
    return
  }

  try {
    await rmdir(directory)
    removed.push(sourcePath)
  } catch {
    // The old domain folder still contains user material that needs manual review.
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

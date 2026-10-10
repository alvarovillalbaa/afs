import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const script = (name) => path.join(root, "skills/use-afs/scripts", `${name}-afs.mjs`)
const run = (name, args) => execFileSync(process.execPath, [script(name), ...args], { encoding: "utf8" })

test("fresh root and application profiles create the current contract and preserve existing instructions", async () => {
  for (const mode of ["root", "docs"]) {
    const target = await mkdtemp(path.join(os.tmpdir(), "afs-contract-"))
    await writeFile(path.join(target, "AGENTS.md"), "# Existing rules\nPreserve this.\n")
    run("create", [target, "--mode", mode, "--no-git", "https://example.com/afs"])
    assert.equal(await readFile(path.join(target, "AGENTS.md"), "utf8"), "# Existing rules\nPreserve this.\n")
    for (const name of ["REFERENCES.md", "SOURCES.md", "GAPS.md", "ROADMAP.md", "BEHAVIOR.md", "IEP.md"]) assert.ok(existsSync(path.join(target, name)))
    const shell = mode === "docs" ? path.join(target, "docs") : target
    for (const name of ["raw", "sources", "references", "templates", "goals", "models/goals", "BRAIN.md", "VISION.md", "FRICTION.md", "PREDICTION.md", "REGRESSIONS.md"]) assert.ok(!existsSync(path.join(shell, name)), name)
    if (mode === "docs") assert.ok(!existsSync(path.join(shell, "AGENTS.md")))
    assert.match(await readFile(path.join(target, "SOURCES.md"), "utf8"), /https:\/\/example.com\/afs/)
    run("validate", [target])
  }
})

test("migration preserves text, rebases links, and refuses to discard unread raw material", async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), "afs-migration-"))
  await mkdir(path.join(target, "references"))
  await mkdir(path.join(target, "raw"))
  await writeFile(path.join(target, "AGENTS.md"), "# Rules\nKeep current rules.\n")
  await writeFile(path.join(target, "BRAIN.md"), "# Management\nUnique owner instructions.\n")
  await writeFile(path.join(target, "references", "example.md"), "# Example\n[Rules](../AGENTS.md)\n")
  await writeFile(path.join(target, "README.md"), "[Example](references/example.md)\n")
  await writeFile(path.join(target, "raw", "unread.md"), "Unread source: https://example.com/private\n")
  const first = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.equal(first.status, 2)
  assert.match(first.stderr, /raw\/ requires verified/)
  assert.equal(await readFile(path.join(target, "raw", "unread.md"), "utf8"), "Unread source: https://example.com/private\n")
  assert.match(await readFile(path.join(target, "AGENTS.md"), "utf8"), /Keep current rules\.[\s\S]*Unique owner instructions\./)
  assert.match(await readFile(path.join(target, "REFERENCES.md"), "utf8"), /\[Rules\]\(AGENTS.md\)/)
  assert.equal(await readFile(path.join(target, "README.md"), "utf8"), "[Example](REFERENCES.md)\n")
  const before = await readFile(path.join(target, "AGENTS.md"), "utf8")
  spawnSync(process.execPath, [script("migrate"), target])
  assert.equal(await readFile(path.join(target, "AGENTS.md"), "utf8"), before)
})

test("validation rejects a retired surface and research without a unit definition", async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), "afs-validation-"))
  run("create", [target, "--mode", "root", "--no-git"])
  await mkdir(path.join(target, "research", "unscoped"))
  await writeFile(path.join(target, "FRICTION.md"), "# Retired\n")
  const result = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /FRICTION.md/)
  assert.match(result.stderr, /research\/unscoped\/README.md/)
})

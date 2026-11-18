import { after, test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { resolveWorkspace } from "../skills/use-afs/scripts/standard.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const script = (name) => path.join(root, "skills/use-afs/scripts", `${name}-afs.mjs`)
const run = (name, args) => execFileSync(process.execPath, [script(name), ...args], { encoding: "utf8" })
const temporary = []
const fixture = async (name) => {
  const target = await mkdtemp(path.join(os.tmpdir(), name))
  temporary.push(target)
  return target
}
after(async () => { for (const target of temporary) await rm(target, { recursive: true }) })

test("application profile detects a docs shell while catalogs stay at the instruction root", async () => {
  const target = await fixture("afs-application-")
  await writeFile(path.join(target, "package.json"), "{}\n")
  await writeFile(path.join(target, "REFERENCES.md"), "# References\n")
  await mkdir(path.join(target, "docs", "audits"), { recursive: true })
  await mkdir(path.join(target, "context")) // application code, outside its AFS shell
  assert.equal(resolveWorkspace(target).profile, "root")
  await writeFile(path.join(target, ".afs-profile.json"), '{"version":1,"profile":"docs"}\n')
  assert.deepEqual(resolveWorkspace(target), {
    target: path.join(target, "docs"), instructionRoot: target, profile: "docs",
  })
  await rm(path.join(target, ".afs-profile.json"))
  await mkdir(path.join(target, "knowledge"))
  await writeFile(path.join(target, "knowledge", "INDEX.md"), "# Standalone knowledge\n")
  assert.equal(resolveWorkspace(target).profile, "root")
})

test("fresh root and application profiles create the current contract and preserve existing instructions", async () => {
  for (const mode of ["root", "docs"]) {
    const target = await fixture("afs-contract-")
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
  const target = await fixture("afs-migration-")
  await mkdir(path.join(target, "references"))
  await mkdir(path.join(target, "raw"))
  await writeFile(path.join(target, "AGENTS.md"), "# Rules\nKeep current rules.\n")
  await writeFile(path.join(target, "BRAIN.md"), "# Management\nUnique owner instructions.\n")
  await writeFile(path.join(target, "references", "example.md"), "# Example\n[Rules](../AGENTS.md)\n")
  await writeFile(path.join(target, "README.md"), "[Example](references/example.md)\n")
  await writeFile(path.join(target, "raw", "unread.md"), "Unread source: https://example.com/private\n")
  const first = spawnSync(process.execPath, [script("migrate"), target, "--registry=references/example.md"], { encoding: "utf8" })
  assert.equal(first.status, 2)
  assert.match(first.stderr, /raw\/ requires verified/)
  assert.equal(await readFile(path.join(target, "raw", "unread.md"), "utf8"), "Unread source: https://example.com/private\n")
  assert.match(await readFile(path.join(target, "AGENTS.md"), "utf8"), /Keep current rules\.[\s\S]*Unique owner instructions\./)
  assert.match(await readFile(path.join(target, "REFERENCES.md"), "utf8"), /\[Rules\]\(AGENTS.md\)/)
  assert.match(await readFile(path.join(target, "README.md"), "utf8"), /^\[Example\]\(REFERENCES.md#afs-migrated-[a-f0-9]+\)\n$/)
  const before = await readFile(path.join(target, "AGENTS.md"), "utf8")
  spawnSync(process.execPath, [script("migrate"), target])
  assert.equal(await readFile(path.join(target, "AGENTS.md"), "utf8"), before)
})

test("validation rejects a retired surface and research without a unit definition", async () => {
  const target = await fixture("afs-validation-")
  run("create", [target, "--mode", "root", "--no-git"])
  await mkdir(path.join(target, "research", "unscoped"))
  await writeFile(path.join(target, "FRICTION.md"), "# Retired\n")
  const result = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /FRICTION.md/)
  assert.match(result.stderr, /research\/unscoped\/README.md/)
})

test("migration never traverses symlinked registry or legacy directory roots", async () => {
  for (const name of ["references", "sources", "cookbook", "items", "models/decisions", "models/problems"]) {
    const target = await fixture("afs-symlink-root-")
    const outside = await fixture("afs-outside-")
    await writeFile(path.join(outside, "keep.md"), "External original\n")
    await mkdir(path.dirname(path.join(target, name)), { recursive: true })
    await symlink(outside, path.join(target, name))
    const result = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
    assert.notEqual(result.status, 0, name)
    assert.equal(await readFile(path.join(outside, "keep.md"), "utf8"), "External original\n", name)
    assert.match(result.stderr, /[Ss]ymlink/)
  }
})

test("migration rejects dangling destination and ancestor symlinks without changing source bytes", async () => {
  for (const ancestor of [false, true]) {
    const target = await fixture("afs-symlink-destination-")
    const outside = await fixture("afs-outside-")
    const source = path.join(target, ancestor ? "FRICTION.md" : "BRAIN.md")
    await writeFile(source, "Keep original\n")
    await symlink(ancestor ? outside : path.join(outside, "missing.md"), path.join(target, ancestor ? "logs" : "AGENTS.md"))
    const result = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
    assert.notEqual(result.status, 0)
    assert.equal(await readFile(source, "utf8"), "Keep original\n")
    assert.ok(!existsSync(path.join(outside, "missing.md")))
    assert.match(result.stderr, /[Ss]ymlink/)
  }
})

test("creator rejects linked source registries including dangling links", async () => {
  for (const dangling of [false, true]) {
    const target = await fixture("afs-create-symlink-")
    const outside = await fixture("afs-outside-")
    const external = path.join(outside, "sources.md")
    if (!dangling) await writeFile(external, "Keep external registry\n")
    await symlink(external, path.join(target, "SOURCES.md"))
    const result = spawnSync(process.execPath, [script("create"), target, "--mode=root", "--no-git", "https://example.com/afs"], { encoding: "utf8" })
    assert.notEqual(result.status, 0)
    if (dangling) assert.ok(!existsSync(external))
    else assert.equal(await readFile(external, "utf8"), "Keep external registry\n")
  }
})

test("unreviewed Markdown snapshots and repository technical guides are retained", async () => {
  const target = await fixture("afs-source-preservation-")
  await writeFile(path.join(target, ".afs-profile.json"), '{"version":1,"profile":"docs"}\n')
  for (const dir of ["references", "sources"]) {
    await mkdir(path.join(target, "docs", dir), { recursive: true })
    await writeFile(path.join(target, "docs", dir, "original.md"), "Original copied content\n")
  }
  const result = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.equal(result.status, 2)
  for (const dir of ["references", "sources"]) assert.equal(await readFile(path.join(target, "docs", dir, "original.md"), "utf8"), "Original copied content\n")
  assert.doesNotMatch(await readFile(path.join(target, "SOURCES.md"), "utf8"), /Original copied content/)
})

test("reviewed registry content under skills is not silently skipped", async () => {
  const target = await fixture("afs-registry-skills-")
  await mkdir(path.join(target, "references", "skills"), { recursive: true })
  await writeFile(path.join(target, "references", "skills", "entry.md"), "Registry entry\n")
  run("migrate", [target, "--registry=references/skills/entry.md"])
  assert.match(await readFile(path.join(target, "REFERENCES.md"), "utf8"), /Registry entry/)
  assert.ok(!existsSync(path.join(target, "references")))
})

test("invalid UTF-8 is retained byte for byte instead of consolidated", async () => {
  const target = await fixture("afs-invalid-utf8-")
  await mkdir(path.join(target, "references"))
  const source = path.join(target, "references", "latin1.md")
  const original = Buffer.from([0x23, 0x20, 0xe9, 0x0a])
  await writeFile(source, original)
  const result = spawnSync(process.execPath, [script("migrate"), target, "--registry=references/latin1.md"], { encoding: "utf8" })
  assert.equal(result.status, 2)
  assert.deepEqual(await readFile(source), original)
  assert.doesNotMatch(await readFile(path.join(target, "REFERENCES.md"), "utf8"), /\uFFFD/)
})

test("an interrupted append can be retried without duplicate instructions", async () => {
  const target = await fixture("afs-retry-")
  const source = path.join(target, "BRAIN.md")
  await writeFile(source, "Unique original instruction\n")
  run("migrate", [target])
  const completed = await readFile(path.join(target, "AGENTS.md"), "utf8")
  await writeFile(source, "Unique original instruction\n") // append succeeded; source retirement did not.
  run("migrate", [target])
  assert.equal(await readFile(path.join(target, "AGENTS.md"), "utf8"), completed)
  assert.ok(!existsSync(source))
})

test("a partial migration marker blocks retry without deleting or duplicating source", async () => {
  const target = await fixture("afs-partial-retry-")
  const source = path.join(target, "BRAIN.md")
  await writeFile(source, "Unique original instruction\n")
  run("migrate", [target])
  const registry = path.join(target, "AGENTS.md")
  const complete = await readFile(registry, "utf8")
  const partial = complete.slice(0, complete.indexOf("Unique original instruction") + 6)
  await writeFile(registry, partial)
  await writeFile(source, "Unique original instruction\n")
  const result = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Partial or changed migration entry/)
  assert.equal(await readFile(source, "utf8"), "Unique original instruction\n")
  assert.equal(await readFile(registry, "utf8"), partial)
})

test("a changed source cannot silently reuse a prior entry anchor", async () => {
  const target = await fixture("afs-changed-source-")
  const source = path.join(target, "BRAIN.md")
  await writeFile(source, "Original version\n")
  run("migrate", [target])
  const destination = path.join(target, "AGENTS.md")
  const original = await readFile(destination, "utf8")
  await writeFile(source, "Changed version\n")
  const result = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Changed migration source/)
  assert.equal(await readFile(source, "utf8"), "Changed version\n")
  assert.equal(await readFile(destination, "utf8"), original)
})

test("dangling profile markers cannot be ignored during detection", async () => {
  const target = await fixture("afs-marker-symlink-")
  const outside = await fixture("afs-outside-")
  await symlink(path.join(outside, "missing.json"), path.join(target, ".afs-profile.json"))
  assert.throws(() => resolveWorkspace(target), /regular file/)
})

test("recorded placement is reused and conflicting explicit profiles stop before creating folders", async () => {
  const target = await fixture("afs-profile-conflict-")
  run("create", [target, "--mode=root", "--no-git"])
  await writeFile(path.join(target, "package.json"), "{}\n")
  run("create", [target, "--no-git"])
  assert.equal(resolveWorkspace(target).profile, "root")
  assert.ok(!existsSync(path.join(target, "docs")))
  const result = spawnSync(process.execPath, [script("create"), target, "--mode=docs", "--no-git"], { encoding: "utf8" })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Existing AFS profile differs/)
  assert.ok(!existsSync(path.join(target, "docs")))
})

test("application instructions prefix owned folders and source URL entries match completely", async () => {
  const target = await fixture("afs-profile-instructions-")
  run("create", [target, "--mode=docs", "--no-git", "https://example.com/afs-v2"])
  const instructions = await readFile(path.join(target, "AGENTS.md"), "utf8")
  for (const folder of ["knowledge", "facts", "research", "cookbooks", "results"]) assert.match(instructions, new RegExp('`docs/' + folder + '/'))
  run("create", [target, "--mode=docs", "--no-git", "https://example.com/afs"])
  const registry = await readFile(path.join(target, "SOURCES.md"), "utf8")
  assert.match(registry, /https:\/\/example.com\/afs \(recorded/)
  run("create", [target, "--mode=docs", "--no-git", "https://example.com/afs"])
  assert.equal(await readFile(path.join(target, "SOURCES.md"), "utf8"), registry)
})

test("generic docs catalogs and an application manifest do not select an AFS docs workspace", async () => {
  const target = await fixture("afs-detection-")
  await writeFile(path.join(target, "package.json"), "{}\n")
  await mkdir(path.join(target, "docs", "references"), { recursive: true })
  for (const name of ["REFERENCES.md", "SOURCES.md"]) await writeFile(path.join(target, "docs", name), "Ordinary documentation\n")
  await writeFile(path.join(target, "docs", "references", "api.md"), "Keep technical guide\n")
  assert.equal(resolveWorkspace(target).profile, "root")
  run("migrate", [target])
  assert.equal(await readFile(path.join(target, "docs", "references", "api.md"), "utf8"), "Keep technical guide\n")
  assert.equal(resolveWorkspace(target, "docs").profile, "docs")
})

test("legacy docs root files are consolidated at the instruction root without losing conflicts", async () => {
  const target = await fixture("afs-legacy-docs-")
  await mkdir(path.join(target, "docs"))
  await writeFile(path.join(target, "AGENTS.md"), "# Current rules\nKeep current rules.\n")
  for (const name of ["AGENTS.md", "BRAIN.md", "GAPS.md", "SOURCES.md", "REFERENCES.md"]) await writeFile(path.join(target, "docs", name), `Unique legacy ${name}\n`)
  assert.equal(resolveWorkspace(target).profile, "docs")
  run("migrate", [target])
  for (const name of ["AGENTS.md", "GAPS.md", "SOURCES.md", "REFERENCES.md"]) {
    assert.match(await readFile(path.join(target, name), "utf8"), new RegExp(`Unique legacy ${name}`))
    assert.ok(!existsSync(path.join(target, "docs", name)))
  }
  const rules = await readFile(path.join(target, "AGENTS.md"), "utf8")
  assert.match(rules, /^# Current rules\nKeep current rules\./)
  assert.match(rules, /Unique legacy BRAIN.md/)
})

test("directory relocation rebases inbound links, nested links and actual conflict destinations", async () => {
  const target = await fixture("afs-directory-links-")
  for (const dir of ["models/decisions", "models/problems/nested", "decisions", "assets"]) await mkdir(path.join(target, dir), { recursive: true })
  await writeFile(path.join(target, "assets", "proof.txt"), "Proof\n")
  await writeFile(path.join(target, "decisions", "choice.md"), "Keep destination\n")
  await writeFile(path.join(target, "models", "decisions", "choice.md"), '[Proof](../../assets/proof.txt "Evidence")\n')
  await writeFile(path.join(target, "models", "problems", "nested", "problem.md"), "[Choice](../../decisions/choice.md)\n")
  await writeFile(path.join(target, "README.md"), '[Choice](models/decisions/choice.md "Decision")\n[Problem](models/problems/nested/problem.md)\n')
  run("migrate", [target])
  assert.equal(await readFile(path.join(target, "decisions", "choice.md"), "utf8"), "Keep destination\n")
  assert.equal(await readFile(path.join(target, "decisions", "choice-migrated.md"), "utf8"), '[Proof](../assets/proof.txt "Evidence")\n')
  assert.equal(await readFile(path.join(target, "problems", "nested", "problem.md"), "utf8"), "[Choice](../../decisions/choice-migrated.md)\n")
  assert.equal(await readFile(path.join(target, "README.md"), "utf8"), '[Choice](decisions/choice-migrated.md "Decision")\n[Problem](problems/nested/problem.md)\n')
  assert.ok(!existsSync(path.join(target, "models")))
})

test("consolidated entries retain distinct anchors, titled links and heading fragments", async () => {
  const target = await fixture("afs-entry-anchors-")
  await mkdir(path.join(target, "references"))
  await writeFile(path.join(target, "references", "a.md"), '# A\n[B](b.md "Other entry")\n[Detail](b.md#detail)\n')
  await writeFile(path.join(target, "references", "b.md"), "# B\n## Detail\nUnique B details.\n")
  await writeFile(path.join(target, "README.md"), '[B](references/b.md "B entry")\n')
  run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
  const registry = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const link = registry.match(/\[B\]\(REFERENCES.md#([^ )]+) "Other entry"\)/)
  assert.ok(link)
  assert.match(registry, new RegExp(`<a id="${link[1]}"></a>\\n## Migrated context: references/b.md`))
  assert.ok(registry.includes(`[Detail](REFERENCES.md#${link[1]}-detail)`))
  assert.ok(registry.includes(`<a id="${link[1]}-detail"></a>\n## Detail`))
  assert.equal(await readFile(path.join(target, "README.md"), "utf8"), `[B](REFERENCES.md#${link[1]} "B entry")\n`)
})

test("empty legacy registry directories still create both required catalogs", async () => {
  const target = await fixture("afs-empty-registries-")
  for (const dir of ["references", "sources"]) await mkdir(path.join(target, dir))
  for (const name of ["AGENTS.md", "GAPS.md"]) await writeFile(path.join(target, name), `# ${name}\n`)
  run("migrate", [target])
  for (const name of ["REFERENCES.md", "SOURCES.md"]) assert.ok(existsSync(path.join(target, name)))
  run("validate", [target])
})

test("directory planning reserves destinations already owned by root consolidation", async () => {
  const target = await fixture("afs-planned-conflict-")
  await mkdir(path.join(target, "models", "decisions"), { recursive: true })
  await writeFile(path.join(target, "DECISIONS.md"), "Unique root decisions\n")
  await writeFile(path.join(target, "models", "decisions", "prior-decisions.md"), "Unique directory decision\n")
  await writeFile(path.join(target, "README.md"), "[Directory](models/decisions/prior-decisions.md)\n[Root](DECISIONS.md)\n")
  run("migrate", [target])
  assert.match(await readFile(path.join(target, "decisions", "prior-decisions.md"), "utf8"), /Unique root decisions/)
  assert.equal(await readFile(path.join(target, "decisions", "prior-decisions-migrated.md"), "utf8"), "Unique directory decision\n")
  const index = await readFile(path.join(target, "README.md"), "utf8")
  assert.match(index, /\[Directory\]\(decisions\/prior-decisions-migrated.md\)/)
  assert.match(index, /\[Root\]\(decisions\/prior-decisions.md#afs-migrated-/)
})

test("legacy type-first facts and models/problems cannot be certified as current", async () => {
  for (const dir of ["facts/items", "facts/episodes", "facts/triples", "models/problems"]) {
    const target = await fixture("afs-legacy-validation-")
    for (const name of ["AGENTS.md", "REFERENCES.md", "SOURCES.md", "GAPS.md"]) await writeFile(path.join(target, name), `# ${name}\n`)
    await mkdir(path.join(target, dir, "domain"), { recursive: true })
    const original = path.join(target, dir, "domain", "original.md")
    await writeFile(original, "Keep record\n")
    const result = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
    assert.equal(result.status, 1)
    assert.ok(result.stderr.includes(dir))
    if (dir.startsWith("facts/")) {
      const migration = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
      assert.equal(migration.status, 2)
      assert.equal(await readFile(original, "utf8"), "Keep record\n")
    }
  }
})

test("validation checks root legacy documentation, domain lesson dates and all unscoped research files", async () => {
  const target = await fixture("afs-validation-coverage-")
  await writeFile(path.join(target, ".afs-profile.json"), '{"version":1,"profile":"docs"}\n')
  for (const name of ["AGENTS.md", "REFERENCES.md", "SOURCES.md", "GAPS.md"]) await writeFile(path.join(target, name), `# ${name}\n`)
  for (const dir of ["official-documentation", "docs/lessons/domain/2026/11-18", "docs/research"]) await mkdir(path.join(target, dir), { recursive: true })
  await writeFile(path.join(target, "docs", "lessons", "domain", "undated.md"), "Undated lesson\n")
  await writeFile(path.join(target, "docs", "lessons", "domain", "2026", "11-18", "dated.md"), "Dated lesson\n")
  for (const name of ["notes.txt", "evidence.csv", "source.pdf"]) await writeFile(path.join(target, "docs", "research", name), "Unscoped artifact\n")
  const result = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /official-documentation/)
  for (const name of ["notes.txt", "evidence.csv", "source.pdf"]) assert.ok(result.stderr.includes(name))
  assert.match(result.stdout, /lessons\/domain\/undated.md should/)
  assert.doesNotMatch(result.stdout, /2026\/11-18\/dated\.md should/)
})

test("reference-style definitions keep entry anchors, fragments and optional titles", async () => {
  const target = await fixture("afs-reference-definitions-")
  await mkdir(path.join(target, "references"))
  await writeFile(path.join(target, "references", "a.md"), '# Entry\n## Detail\n[Home][home]\n\n[home]: ../README.md "Home title"\n')
  await writeFile(path.join(target, "README.md"), '[Entry][entry]\n\n[entry]: references/a.md "Entry title"\n[detail]: <references/a.md#detail> \'Detail title\'\n[nextline]:\n  references/a.md (Next title)\n[crlf]: references/a.md "Windows title"\r\n[external]: https://example.com/source "External title"\n')
  run("migrate", [target, "--registry=references/a.md"])
  const index = await readFile(path.join(target, "README.md"), "utf8")
  const registry = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const definition = index.match(/^\[entry\]: REFERENCES.md#([^ ]+) "Entry title"$/m)
  assert.ok(definition, index)
  assert.ok(registry.includes(`<a id="${definition[1]}"></a>`))
  assert.ok(index.includes(`[detail]: <REFERENCES.md#${definition[1]}-detail> 'Detail title'`))
  assert.ok(index.includes(`[nextline]:\n  REFERENCES.md#${definition[1]} (Next title)`))
  assert.ok(index.includes(`[crlf]: REFERENCES.md#${definition[1]} "Windows title"\r\n`))
  const home = registry.match(/^\[([^\]]+)\]: README.md "Home title"$/m)
  assert.ok(home, registry)
  assert.ok(registry.includes(`[Home][${home[1]}]`))
  assert.ok(index.includes('[external]: https://example.com/source "External title"'))
  assert.ok(!existsSync(path.join(target, "references", "a.md")))
})

test("legacy docs detection persists across blocked migration retries", async () => {
  const target = await fixture("afs-persistent-docs-profile-")
  await mkdir(path.join(target, "docs", "raw"), { recursive: true })
  for (const name of ["AGENTS.md", "BRAIN.md", "GAPS.md"]) await writeFile(path.join(target, "docs", name), `Legacy ${name}\n`)
  const source = path.join(target, "docs", "raw", "source.md")
  await writeFile(source, "Keep unread source\n")
  const first = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.equal(first.status, 2)
  assert.equal(resolveWorkspace(target).profile, "docs")
  assert.deepEqual(JSON.parse(await readFile(path.join(target, ".afs-profile.json"), "utf8")), { version: 1, profile: "docs" })
  const second = spawnSync(process.execPath, [script("migrate"), target], { encoding: "utf8" })
  assert.equal(second.status, 2)
  assert.match(second.stderr, /raw\/ requires verified/)
  const validation = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
  assert.equal(validation.status, 1)
  assert.match(validation.stderr, /raw\//)
  assert.equal(await readFile(source, "utf8"), "Keep unread source\n")
})

test("mandatory root documents must be regular files", async () => {
  for (const required of ["AGENTS.md", "REFERENCES.md", "SOURCES.md", "GAPS.md"]) {
    const target = await fixture("afs-required-document-type-")
    for (const name of ["AGENTS.md", "REFERENCES.md", "SOURCES.md", "GAPS.md"]) await writeFile(path.join(target, name), `# ${name}\n`)
    await rm(path.join(target, required))
    await mkdir(path.join(target, required))
    await writeFile(path.join(target, required, "keep.txt"), "Keep directory content\n")
    const result = spawnSync(process.execPath, [script("validate"), target], { encoding: "utf8" })
    assert.equal(result.status, 1, required)
    assert.ok(result.stderr.includes(required))
    assert.match(result.stderr, /regular file/)
    assert.equal(await readFile(path.join(target, required, "keep.txt"), "utf8"), "Keep directory content\n")
  }
})

test("consolidated reference labels retain each document's destinations", async () => {
  const target = await fixture("afs-reference-labels-")
  await mkdir(path.join(target, "references"))
  for (const [name, url] of [["a", "https://example.com/a"], ["b", "https://example.com/b"]]) {
    await writeFile(path.join(target, "references", `${name}.md`), `# ${name}\n## [Source][source]\n[Source][source]\n[Source \`code\`][source]\n[SOURCE][]\n[source]\n![Logo][source]\nNote[^note]\n\n[source]: ${url} "${name} title"\n[^note]: Note ${name}\n\n\`[source]\`\n~~~md\n[source]: https://example.com/code\n[Source][source]\n~~~\n`)
  }
  await writeFile(path.join(target, "README.md"), "[Heading a](references/a.md#source)\n[Heading b](references/b.md#source)\n")
  run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const definitions = [...text.matchAll(/^\[([^\]]+)\]: (https:\/\/example.com\/([ab])) "[ab] title"$/gm)]
  assert.equal(definitions.length, 2)
  assert.notEqual(definitions[0][1].toLowerCase(), definitions[1][1].toLowerCase())
  for (const definition of definitions) {
    const start = text.indexOf(`## Migrated context: references/${definition[3]}.md`)
    const end = text.indexOf("<!-- /afs-migration -->", start)
    const entry = text.slice(start, end)
    assert.ok(entry.includes(`[Source][${definition[1]}]`), entry)
    assert.ok(entry.includes(`[Source \`code\`][${definition[1]}]`), entry)
    assert.ok(entry.includes(`[SOURCE][${definition[1]}]`), entry)
    assert.ok(entry.includes(`[source][${definition[1]}]`), entry)
    assert.ok(entry.includes(`![Logo][${definition[1]}]`), entry)
    assert.ok(entry.includes("`[source]`"), entry)
    assert.ok(entry.includes("~~~md\n[source]: https://example.com/code\n[Source][source]\n~~~"), entry)
  }
  const footnotes = [...text.matchAll(/^\[\^([^\]]+)\]: Note ([ab])$/gm)]
  assert.equal(footnotes.length, 2)
  assert.notEqual(footnotes[0][1], footnotes[1][1])
  for (const footnote of footnotes) {
    const start = text.indexOf(`## Migrated context: references/${footnote[2]}.md`)
    const end = text.indexOf("<!-- /afs-migration -->", start)
    assert.ok(text.slice(start, end).includes(`Note[^${footnote[1]}]`))
  }
  const index = await readFile(path.join(target, "README.md"), "utf8")
  for (const link of index.matchAll(/\[Heading [ab]\]\(REFERENCES.md#([^)]*)\)/g)) assert.ok(text.includes(`<a id="${link[1]}"></a>`))
})

test("rebased path segments escape filename characters instead of creating URL fragments", async () => {
  const target = await fixture("afs-reserved-filenames-")
  await mkdir(path.join(target, "models", "decisions"), { recursive: true })
  const names = [["C#.md", "C%23.md"], ["why?.md", "why%3F.md"], ["one).md", "one%29.md"]]
  for (const [name] of names) await writeFile(path.join(target, "models", "decisions", name), "Keep decision\n")
  await writeFile(path.join(target, "README.md"), names.map(([, encoded]) => `[Decision](models/decisions/${encoded})`).join("\n") + "\n[Raw](models/decisions/C%23.md?raw=1)\n")
  run("migrate", [target])
  const index = await readFile(path.join(target, "README.md"), "utf8")
  for (const [name, encoded] of names) {
    assert.ok(index.includes(`[Decision](decisions/${encoded})`), index)
    assert.equal(await readFile(path.join(target, "decisions", name), "utf8"), "Keep decision\n")
  }
  assert.ok(index.includes("[Raw](decisions/C%23.md?raw=1)"), index)
})

test("consolidated explicit HTML anchors keep incoming and local fragment targets", async () => {
  const target = await fixture("afs-html-anchors-")
  await mkdir(path.join(target, "references"))
  await writeFile(path.join(target, "references", "entry.md"), '<a id="custom"></a>\n<span id=other></span>\n<a name=legacy></a>\n<a href="#custom">Local custom</a>\n[Local](#custom)\n<a\n  id="multiline"\n></a>\n`<a id="example"></a>`\n~~~html\n<a id="example"></a>\n~~~\n')
  await writeFile(path.join(target, "README.md"), "[Custom](references/entry.md#custom)\n[Other](references/entry.md#other)\n[Legacy](references/entry.md#legacy)\n[Multi](references/entry.md#multiline)\n")
  run("migrate", [target, "--registry=references/entry.md"])
  const index = await readFile(path.join(target, "README.md"), "utf8")
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const incoming = index.match(/\[Custom\]\(REFERENCES.md#([^)]*)-custom\)/)
  assert.ok(incoming, index)
  const prefix = incoming[1]
  assert.ok(text.includes(`<a id="${prefix}-custom"></a>`), text)
  assert.ok(text.includes(`<span id=${prefix}-other></span>`), text)
  assert.ok(text.includes(`<a name=${prefix}-legacy></a>`), text)
  assert.ok(text.includes(`<a href="REFERENCES.md#${prefix}-custom">Local custom</a>`), text)
  assert.ok(text.includes(`[Local](REFERENCES.md#${prefix}-custom)`), text)
  assert.ok(text.includes(`id="${prefix}-multiline"`), text)
  assert.ok(text.includes('`<a id="example"></a>`'), text)
  assert.ok(text.includes('~~~html\n<a id="example"></a>\n~~~'), text)
})

test("reference namespacing preserves inline destinations, titles and escaped literals", async () => {
  const target = await fixture("afs-reference-literals-")
  await mkdir(path.join(target, "references"))
  const slash = String.fromCharCode(92)
  const literal = "Literal " + slash + "[source]"
  const even = "Even " + slash.repeat(2) + "[source]"
  const external = '[Document](https://example.com/[source] "Title [source]")'
  await writeFile(path.join(target, "references", "entry.md"), `[source]: https://example.com/actual\n\n${external}\n${literal}\n${even}\n`)
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const label = text.match(/^\[([^\]]+)\]: https:\/\/example.com\/actual$/m)[1]
  assert.ok(text.includes(external), text)
  assert.equal(text.split("\n").find((line) => line.startsWith("Literal ")), literal)
  assert.ok(text.includes(even + `[${label}]`), text)
})

test("list and footnote prose references are distinguished from indented code", async () => {
  const target = await fixture("afs-reference-continuations-")
  await mkdir(path.join(target, "references"))
  await writeFile(path.join(target, "references", "entry.md"), '- Source:\n\n    [List][source]\n\n[^note]: Note\n\n    [Note][source]\n\nOrdinary paragraph\n\n    [source]\n\n[source]: https://example.com/continuation\n')
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const label = text.match(/^\[([^\]]+)\]: https:\/\/example.com\/continuation$/m)[1]
  assert.ok(text.includes(`    [List][${label}]`), text)
  assert.ok(text.includes(`    [Note][${label}]`), text)
  assert.ok(text.includes("\n    [source]\n"), text)
})

test("HTML namespacing preserves quoted contents of unrelated attributes", async () => {
  const target = await fixture("afs-html-attribute-values-")
  await mkdir(path.join(target, "references"))
  const title = 'title="The id=\'document\' value"'
  const data = 'data-example=\'name="other" href="#fake"\''
  await writeFile(path.join(target, "references", "entry.md"), `<a id="target" ${title} ${data}>Target</a>\n`)
  await writeFile(path.join(target, "README.md"), "[Target](references/entry.md#target)\n")
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  assert.ok(text.includes(title), text)
  assert.ok(text.includes(data), text)
  const fragment = (await readFile(path.join(target, "README.md"), "utf8")).match(/REFERENCES.md#([^)]*)/)[1]
  assert.ok(text.includes(`id="${fragment}"`), text)
})

test("block quote reference definitions retain document-wide ownership", async () => {
  const target = await fixture("afs-reference-quote-definitions-")
  await mkdir(path.join(target, "references"))
  for (const [name, prefix] of [["a", "> "], ["b", "> > "]]) {
    await writeFile(path.join(target, `asset-${name}.md`), "Keep target\n")
    const local = name === "a" ? `${prefix}[local]: ../asset-${name}.md` : `${prefix}[local]:\n${prefix}  ../asset-${name}.md`
    await writeFile(path.join(target, "references", `${name}.md`), `[Source][source]\n[Local][local]\n\n${prefix}[source]: https://example.com/${name}\n${local}\n`)
  }
  run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const definitions = [...text.matchAll(/^(?:> )+\[([^\]]+)\]: https:\/\/example.com\/([ab])$/gm)]
  assert.equal(definitions.length, 2)
  assert.notEqual(definitions[0][1], definitions[1][1])
  for (const definition of definitions) {
    const start = text.indexOf(`## Migrated context: references/${definition[2]}.md`)
    const end = text.indexOf("<!-- /afs-migration -->", start)
    assert.ok(text.slice(start, end).includes(`[Source][${definition[1]}]`), text)
  }
  const localDefinitions = [...text.matchAll(/^(?:> )+\[([^\]]+)\]:[ \t]*(?:\n(?:> )+[ \t]*)?(asset-[ab]\.md)$/gm)]
  assert.equal(localDefinitions.length, 2, text)
  for (const definition of localDefinitions) assert.ok(existsSync(path.join(target, definition[2])))
})

test("angle-delimited inline destinations are not mistaken for shortcut references", async () => {
  const target = await fixture("afs-angle-inline-target-")
  await mkdir(path.join(target, "references"))
  const inline = '[source](<https://example.com/foo(bar>)'
  await writeFile(path.join(target, "references", "entry.md"), `[source]: https://example.com/reference\n\n${inline}\n`)
  run("migrate", [target, "--registry=references/entry.md"])
  assert.ok((await readFile(path.join(target, "REFERENCES.md"), "utf8")).includes(inline))
})

test("continued definition data and multiline code remain literal", async () => {
  const target = await fixture("afs-continued-reference-data-")
  await mkdir(path.join(target, "references"))
  const continuedTitle = '  "title [source]"'
  const continuedDestination = '  https://example.com/continued "other [source]"'
  const code = '`literal\n[source]\ncode`'
  await writeFile(path.join(target, "references", "entry.md"), `[source]: https://source.example\n[doc]: https://example.com\n${continuedTitle}\n[other]:\n${continuedDestination}\n\n[doc] [other]\n\n${code}\n`)
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  assert.ok(text.includes(continuedTitle), text)
  assert.ok(text.includes(continuedDestination), text)
  assert.ok(text.includes(code), text)
})

test("namespaced labels stay valid at the label limit and match Unicode case folds", async () => {
  const target = await fixture("afs-reference-label-limits-")
  await mkdir(path.join(target, "references"))
  const longLabel = "L".repeat(999)
  await writeFile(path.join(target, "references", "entry.md"), `[Long][${longLabel}]\n[German][ẞ]\n\n[${longLabel}]: https://example.com/long\n[SS]: https://example.com/german\n`)
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const long = text.match(/^\[([^\]]+)\]: https:\/\/example.com\/long$/m)[1]
  const german = text.match(/^\[([^\]]+)\]: https:\/\/example.com\/german$/m)[1]
  assert.ok(long.length <= 999)
  assert.ok(text.includes(`[Long][${long}]`))
  assert.ok(text.includes(`[German][${german}]`))
})

test("link rebasing preserves code literals in consolidated, moved and inbound documents", async () => {
  const target = await fixture("afs-rebase-code-literals-")
  await mkdir(path.join(target, "references"))
  await mkdir(path.join(target, "models", "decisions"), { recursive: true })
  const code = '`[B](b.md)`\n\n~~~js\nconst sample = "[B](b.md)";\n~~~\n\n    [B](b.md)\n\n    - [B](b.md)\n\n    1. [B](b.md)\n'
  await writeFile(path.join(target, "references", "a.md"), `[B](b.md)\n\n${code}`)
  await writeFile(path.join(target, "references", "b.md"), "# B\n")
  const decisionCode = code.replaceAll("b.md", "../../references/b.md")
  await writeFile(path.join(target, "models", "decisions", "choice.md"), `[B](../../references/b.md)\n\n${decisionCode}`)
  const inboundCode = code.replaceAll("b.md", "references/b.md")
  await writeFile(path.join(target, "README.md"), `[B](references/b.md)\n\n${inboundCode}`)
  run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
  for (const [name, literal] of [["REFERENCES.md", code], ["decisions/choice.md", decisionCode], ["README.md", inboundCode]]) {
    const text = await readFile(path.join(target, name), "utf8")
    assert.ok(text.includes(literal), `${name}: ${text}`)
    assert.match(text, /\[B\]\((?:\.\.\/)?REFERENCES.md#afs-migrated-[a-f0-9]+\)/)
  }
})

test("link rebasing handles balanced and escaped parentheses in actual destinations", async () => {
  const target = await fixture("afs-rebase-parentheses-")
  await mkdir(path.join(target, "models", "decisions"), { recursive: true })
  const name = "choice(v2).md"
  await writeFile(path.join(target, "models", "decisions", name), "# Choice\n")
  const slash = String.fromCharCode(92)
  const escaped = `choice${slash}(v2${slash}).md`
  await writeFile(path.join(target, "README.md"), `[Choice](models/decisions/${name} "Title (v2)")\n![Image](models/decisions/${escaped})\n[Angle](<models/decisions/${name}>)\n[Ref][choice]\n\n[choice]: models/decisions/${escaped} 'Reference (v2)'\n`)
  run("migrate", [target])
  const text = await readFile(path.join(target, "README.md"), "utf8")
  assert.ok(text.includes('[Choice](decisions/choice%28v2%29.md "Title (v2)")'), text)
  assert.ok(text.includes("![Image](decisions/choice%28v2%29.md)"), text)
  assert.ok(text.includes("[Angle](<decisions/choice%28v2%29.md>)"), text)
  assert.ok(text.includes("[Ref][choice]"), text)
  assert.ok(text.includes("[choice]: decisions/choice%28v2%29.md 'Reference (v2)'"), text)
  assert.equal(await readFile(path.join(target, "decisions", name), "utf8"), "# Choice\n")
})

test("HTML destinations follow registry and directory relocations without changing literals", async () => {
  const target = await fixture("afs-html-destinations-")
  await mkdir(path.join(target, "references"))
  await mkdir(path.join(target, "models", "decisions"), { recursive: true })
  await writeFile(path.join(target, "asset.png"), "Synthetic image\n")
  const code = '`<a href="b.md">B</a>`\n\n~~~html\n<a href="b.md">B</a>\n~~~\n\n<!--\n\n<a href="b.md">Comment literal</a>\n-->\n'
  await writeFile(path.join(target, "references", "a.md"), `<a href="b.md">B</a>\n<a href='b.md#custom' title="href='literal'">Custom</a>\n<img src="../asset.png" alt="Image">\n<a href="#local">Local</a>\n<span id="local"></span>\n\n${code}`)
  await writeFile(path.join(target, "references", "b.md"), '<a id="custom"></a>\n')
  await writeFile(path.join(target, "models", "decisions", "choice.md"), '<a href="../../references/b.md">B</a>\n')
  await writeFile(path.join(target, "README.md"), '<a href=models/decisions/choice.md>Choice</a>\n')
  run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  const b = text.match(/<a href="REFERENCES.md#(afs-migrated-[a-f0-9]+)">B<\/a>/)
  assert.ok(b, text)
  assert.ok(text.includes(`<a href='REFERENCES.md#${b[1]}-custom' title="href='literal'">Custom</a>`), text)
  assert.ok(text.includes(`<a id="${b[1]}-custom"></a>`), text)
  assert.ok(text.includes('<img src="asset.png" alt="Image">'), text)
  const local = text.match(/<a href="REFERENCES.md#([^"]+-local)">Local<\/a>/)
  assert.ok(local && text.includes(`id="${local[1]}"`), text)
  assert.ok(text.includes(code), text)
  assert.ok((await readFile(path.join(target, "decisions", "choice.md"), "utf8")).includes(`href="../REFERENCES.md#${b[1]}"`))
  assert.equal(await readFile(path.join(target, "README.md"), "utf8"), '<a href="decisions/choice.md">Choice</a>\n')
})

test("heading anchors respect opening fence length and closing delimiter rules", async () => {
  const target = await fixture("afs-heading-fence-length-")
  await mkdir(path.join(target, "references"))
  const samples = ["`", "~"].map((char) => `${char.repeat(4)}md\n${char.repeat(3)}\n# Literal heading\n${char.repeat(4)} trailing text\n# Still literal\n${char.repeat(4)}\n`).join("\n")
  await writeFile(path.join(target, "references", "entry.md"), `${samples}\n# Actual heading\n`)
  run("migrate", [target, "--registry=references/entry.md"])
  const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
  assert.ok(text.includes(samples), text)
  assert.match(text, /<a id="afs-migrated-[a-f0-9]+-actual-heading"><\/a>\n# Actual heading/)
})

test("HTML destination entities retain resource identity or block source retirement", async () => {
  const target = await fixture("afs-html-url-entities-")
  await mkdir(path.join(target, "references"))
  await writeFile(path.join(target, "asset&icon.png"), "Synthetic image\n")
  await writeFile(path.join(target, "references", "entry.md"), '<img src="../asset&amp;icon&#46;png?first=1&amp;second=2">\n<a href=../asset%26icon.png?two&#32;words>Target</a>\n')
  run("migrate", [target, "--registry=references/entry.md"])
  assert.ok((await readFile(path.join(target, "REFERENCES.md"), "utf8")).includes('src="asset%26icon.png?first=1&amp;second=2"'))
  assert.ok((await readFile(path.join(target, "REFERENCES.md"), "utf8")).includes('href="asset%26icon.png?two words"'))
  const blocked = await fixture("afs-html-url-entity-block-")
  await mkdir(path.join(blocked, "references"))
  const original = '<a href="../asset&copy;.md">Unsupported named entity</a>\n'
  await writeFile(path.join(blocked, "references", "entry.md"), original)
  const result = spawnSync(process.execPath, [script("migrate"), blocked, "--registry=references/entry.md"], { encoding: "utf8" })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /HTML URL entity requires content review; source retained/)
  assert.equal(await readFile(path.join(blocked, "references", "entry.md"), "utf8"), original)
})

test("unmatched backticks in separate blocks cannot suppress actual link rebasing", async () => {
  for (const gap of ["\n", ""]) {
    const target = await fixture("afs-code-span-block-boundary-")
    await mkdir(path.join(target, "references"))
    await writeFile(path.join(target, "references", "a.md"), `An unmatched \` marker.\n${gap}~~~md\nliteral\n~~~\n${gap}[Actual](b.md)\n\nA later \` marker.\n`)
    await writeFile(path.join(target, "references", "b.md"), "# B\n")
    run("migrate", [target, "--registry=references/a.md", "--registry=references/b.md"])
    const text = await readFile(path.join(target, "REFERENCES.md"), "utf8")
    assert.match(text, /\[Actual\]\(REFERENCES.md#afs-migrated-[a-f0-9]+\)/)
    assert.ok(text.includes("~~~md\nliteral\n~~~"), text)
  }
})

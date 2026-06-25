#!/usr/bin/env node
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const skillDir = path.resolve(scriptDir, "..")

const standardDirs = [
  "logs",
  "lessons",
  "items",
  "fixes",
  "steers",
  "models",
  "reflections",
  "audits",
  "raw",
  "plans",
  "specs",
  "sources",
  "lib",
  "objects",
  "references",
  "cookbook",
  "knowledge",
  "runbooks",
  "research",
  "context",
]

const rootTemplates = [
  "AGENTS.md",
  "BRAIN.md",
  "CLAUDE.md",
  "VISION.md",
  "LOOPS.md",
  "TASTE.md",
  "MEMORY.md",
  "PLAYBOOK.md",
  "PLAN.md",
  "SPEC.md",
  "SOUL.md",
  "USER.md",
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
]

const compatTemplates = {
  gbrain: "GBRAIN.md",
  qmd: "QMD.md",
}

const appMarkers = [
  "package.json",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "Gemfile",
  "mix.exs",
  "composer.json",
  "next.config.js",
  "next.config.mjs",
  "vite.config.ts",
  "vite.config.js",
]

function usage() {
  console.log(`Usage:
  npm run afs:create
  npm run afs:create -- https://example.com/afs-standard
  npm run afs:create -- ../agents-fs
  npm run afs:create -- --mode docs
  npm run afs:create -- --mode standalone --github
  npm run afs:create -- ../agents-fs --compat gbrain,qmd

Modes:
  auto        Choose root, docs/, or agents-fs/ based on the target folder.
  root        Install AFS directly into the target folder.
  docs        Install AFS inside target/docs/ for application repositories.
  standalone  Install a standalone agents-fs workspace or repository.
`)
}

function parseArgs(argv) {
  const result = {
    target: "",
    mode: "auto",
    compat: [],
    git: true,
    github: false,
    owner: "",
    repoName: "agents-fs",
    sourceUrl: "",
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--help" || arg === "-h") {
      result.help = true
      continue
    }

    if (arg === "--mode") {
      result.mode = argv[index + 1] ?? result.mode
      index += 1
      continue
    }

    if (arg.startsWith("--mode=")) {
      result.mode = arg.slice("--mode=".length)
      continue
    }

    if (arg === "--compat") {
      result.compat = parseList(argv[index + 1] ?? "")
      index += 1
      continue
    }

    if (arg.startsWith("--compat=")) {
      result.compat = parseList(arg.slice("--compat=".length))
      continue
    }

    if (arg === "--no-git") {
      result.git = false
      continue
    }

    if (arg === "--github") {
      result.github = true
      result.git = true
      continue
    }

    if (arg === "--no-github") {
      result.github = false
      continue
    }

    if (arg === "--owner") {
      result.owner = argv[index + 1] ?? ""
      index += 1
      continue
    }

    if (arg.startsWith("--owner=")) {
      result.owner = arg.slice("--owner=".length)
      continue
    }

    if (arg === "--repo-name") {
      result.repoName = argv[index + 1] ?? result.repoName
      index += 1
      continue
    }

    if (arg.startsWith("--repo-name=")) {
      result.repoName = arg.slice("--repo-name=".length)
      continue
    }

    if (isUrl(arg) && !result.sourceUrl) {
      result.sourceUrl = arg
      continue
    }

    if (!result.target) {
      result.target = arg
    }
  }

  return result
}

function isUrl(value) {
  return value.startsWith("https://") || value.startsWith("http://")
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

async function listVisibleEntries(directory) {
  if (!existsSync(directory)) {
    return []
  }

  const entries = await readdir(directory, { withFileTypes: true })
  return entries.filter((entry) => !entry.name.startsWith("."))
}

async function looksLikeApplicationRepo(directory) {
  if (!existsSync(directory)) {
    return false
  }

  for (const marker of appMarkers) {
    if (existsSync(path.join(directory, marker))) {
      return true
    }
  }

  const codeDirs = ["app", "src", "lib", "packages", "apps", "server", "client"]
  return codeDirs.some((dir) => existsSync(path.join(directory, dir)))
}

function looksLikeAfs(directory) {
  return (
    existsSync(path.join(directory, "BRAIN.md")) ||
    existsSync(path.join(directory, "knowledge", "INDEX.md")) ||
    existsSync(path.join(directory, "sources")) ||
    existsSync(path.join(directory, "logs"))
  )
}

async function resolveInstallTarget(args) {
  const base = path.resolve(process.cwd(), args.target || ".")
  const baseExists = existsSync(base)
  const baseEntries = await listVisibleEntries(base)
  const baseIsEmpty = !baseExists || baseEntries.length === 0
  const baseIsSparse = baseExists && baseEntries.length <= 3
  const appRepo = await looksLikeApplicationRepo(base)
  const afsRepo = looksLikeAfs(base)

  if (args.mode === "root") {
    return {
      target: base,
      profile: "root",
      reason: "explicit root mode",
    }
  }

  if (args.mode === "docs") {
    return {
      target: path.join(base, "docs"),
      profile: "docs",
      reason: "explicit docs mode",
    }
  }

  if (args.mode === "standalone") {
    return {
      target: args.target ? base : path.join(base, args.repoName),
      profile: "standalone",
      reason: "explicit standalone mode",
    }
  }

  if (args.mode !== "auto") {
    throw new Error(`Unknown mode: ${args.mode}`)
  }

  if (!baseExists) {
    return {
      target: base,
      profile: "standalone",
      reason: "target folder does not exist",
    }
  }

  if (baseIsEmpty) {
    return {
      target: base,
      profile: "root",
      reason: "empty folder",
    }
  }

  if (appRepo) {
    return {
      target: path.join(base, "docs"),
      profile: "docs",
      reason: "application repository detected",
    }
  }

  if (afsRepo || baseIsSparse) {
    return {
      target: base,
      profile: afsRepo ? "root" : "root",
      reason: afsRepo ? "existing AFS marker found" : "sparse folder",
    }
  }

  return {
    target: path.join(base, args.repoName),
    profile: "standalone",
    reason: "non-empty folder without application markers",
  }
}

async function copyIfMissing(source, destination, created) {
  if (existsSync(destination)) {
    return
  }

  await mkdir(path.dirname(destination), { recursive: true })
  await copyFile(source, destination)
  created.push(destination)
}

async function writeIfMissing(destination, content, created) {
  if (existsSync(destination)) {
    return
  }

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, content)
  created.push(destination)
}

async function copyTreeIfMissing(sourceRoot, destinationRoot, created) {
  if (path.resolve(sourceRoot) === path.resolve(destinationRoot)) {
    return
  }

  const entries = await readdir(sourceRoot, { withFileTypes: true })

  for (const entry of entries) {
    const source = path.join(sourceRoot, entry.name)
    const destination = path.join(destinationRoot, entry.name)

    if (entry.isDirectory()) {
      await copyTreeIfMissing(source, destination, created)
      continue
    }

    if (entry.isFile()) {
      await copyIfMissing(source, destination, created)
    }
  }
}

async function copyWorkspaceTemplates(target, created) {
  await copyTreeIfMissing(
    path.join(skillDir, "templates", "workspace"),
    target,
    created
  )
}

function runGit(target, args, profile) {
  if (!args.git || profile === "docs") {
    return { initialized: false, pushed: false }
  }

  const gitDir = path.join(target, ".git")
  const initialized = !existsSync(gitDir)

  if (initialized) {
    try {
      execFileSync("git", ["init"], { cwd: target, stdio: "ignore" })
    } catch {
      console.warn("Git initialization did not complete. The AFS files were still created.")
      return { initialized: false, pushed: false }
    }
  }

  if (!args.github) {
    return { initialized, pushed: false }
  }

  const repo = args.owner
    ? `${args.owner}/${args.repoName}`
    : args.repoName

  try {
    execFileSync(
      "gh",
      [
        "repo",
        "create",
        repo,
        "--private",
        "--source",
        target,
        "--remote",
        "origin",
        "--push",
      ],
      { cwd: target, stdio: "inherit" }
    )
    return { initialized, pushed: true }
  } catch {
    console.warn(
      "GitHub repo creation did not complete. Install gh and authenticate, then run:"
    )
    console.warn(`  gh repo create ${repo} --private --source ${target} --remote origin --push`)
    return { initialized, pushed: false }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    usage()
    return
  }

  const placement = await resolveInstallTarget(args)
  const target = placement.target
  const created = []

  await mkdir(target, { recursive: true })

  for (const dir of standardDirs) {
    await mkdir(path.join(target, dir), { recursive: true })
  }

  for (const template of rootTemplates) {
    await copyIfMissing(
      path.join(skillDir, "templates", "root", template),
      path.join(target, template),
      created
    )
  }

  await copyWorkspaceTemplates(target, created)

  if (args.sourceUrl) {
    await writeIfMissing(
      path.join(target, "sources", "afs-standard-source.md"),
      `# AFS Standard Source\n\n- URL: ${args.sourceUrl}\n- Capture status: install source recorded\n`,
      created
    )
  }

  for (const compat of args.compat) {
    const template = compatTemplates[compat]

    if (!template) {
      console.warn(`Unknown compatibility template skipped: ${compat}`)
      continue
    }

    await copyIfMissing(
      path.join(skillDir, "templates", "compat", template),
      path.join(target, template),
      created
    )
  }

  await copyTreeIfMissing(skillDir, path.join(target, "skills", "use-afs"), created)

  const stats = await stat(target)

  if (!stats.isDirectory()) {
    throw new Error(`${target} is not a directory`)
  }

  const gitResult = runGit(target, args, placement.profile)

  console.log(`AFS workspace ready: ${target}`)
  console.log(`Install profile: ${placement.profile} (${placement.reason})`)

  if (gitResult.initialized) {
    console.log("Initialized a local Git repository.")
  }

  if (gitResult.pushed) {
    console.log("Created and pushed the GitHub repository.")
  } else if (placement.profile === "standalone" && !args.github) {
    console.log("Recommended next step:")
    console.log(`  gh repo create ${args.owner ? `${args.owner}/` : ""}${args.repoName} --private --source ${target} --remote origin --push`)
  }

  if (created.length > 0) {
    console.log("Created files:")
    for (const file of created.sort()) {
      console.log(`- ${path.relative(target, file)}`)
    }
  } else {
    console.log("No template files were created because they already exist.")
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

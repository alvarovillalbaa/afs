import { existsSync, lstatSync, readFileSync } from "node:fs"
import { lstat } from "node:fs/promises"
import path from "node:path"

export const standardDirs = [
  "logs", "lessons", "facts", "facts/general", "fixes", "decisions",
  "steers", "reflections", "audits", "plans", "specs", "lib",
  "objects", "results", "cookbooks", "knowledge", "runbooks", "research",
]

export const rootTemplates = [
  "AGENTS.md", "CLAUDE.md", "SOUL.md", "USER.md", "DESIGN.md", "PRODUCT.md",
  "COMPANY.md", "VALUES.md", "ICP.md", "VOICE.md", "HEARTBEAT.md", "ROADMAP.md",
  "TASTE.md", "BEHAVIOR.md", "IEP.md", "REFERENCES.md", "GAPS.md", "SOURCES.md",
  "LOOPS.md", "MEMORY.md", "PLAYBOOK.md", "PLAN.md", "SPEC.md",
]

export const removedRootFiles = [
  "FRICTION.md", "PREDICTION.md", "REGRESSIONS.md", "BRAIN.md", "VISION.md",
  "FOCUS.md", "RUNBOOK.md", "DECISIONS.md",
]

export const removedDirs = ["raw", "sources", "templates", "goals", "models/goals", "problems", "models/problems", "facts/items", "facts/episodes", "facts/triples"]

export async function safePath(root, candidate) {
  const relative = path.relative(root, candidate)
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Path is outside the workspace: ${candidate}`)
  }
  const parts = relative ? relative.split(path.sep) : []
  let current = root
  let info
  for (let index = 0; index <= parts.length; index++) {
    if (index) current = path.join(current, parts[index - 1])
    try { info = await lstat(current) } catch (error) {
      if (error.code === "ENOENT") return null
      throw error
    }
    if (info.isSymbolicLink()) throw new Error(`Symlink path requires owner review: ${current}`)
    if (index < parts.length && !info.isDirectory()) throw new Error(`Not a directory: ${current}`)
  }
  return info
}

export function resolveWorkspace(input = ".", mode = "auto") {
  const originalTarget = path.resolve(input)
  const docs = path.join(originalTarget, "docs")
  if (!["auto", "root", "docs"].includes(mode)) throw new Error(`Unknown workspace mode: ${mode}`)
  const marker = path.join(originalTarget, ".afs-profile.json")
  const markerInfo = lstatSync(marker, { throwIfNoEntry: false })
  if (mode === "auto" && markerInfo) {
    if (!markerInfo.isFile()) throw new Error("AFS profile marker must be a regular file")
    const saved = JSON.parse(readFileSync(marker, "utf8"))
    if (saved.version !== 1 || !["root", "docs"].includes(saved.profile)) throw new Error("Invalid AFS profile marker")
    mode = saved.profile
  }
  const legacyDocs = ["AGENTS.md", "BRAIN.md", "GAPS.md"].every((name) => existsSync(path.join(docs, name)))
  if (mode === "docs" || (mode === "auto" && !existsSync(path.join(originalTarget, "knowledge", "INDEX.md")) &&
      (existsSync(path.join(docs, "knowledge", "INDEX.md")) || legacyDocs))) {
    return { target: docs, instructionRoot: originalTarget, profile: "docs" }
  }
  return { target: originalTarget, instructionRoot: originalTarget, profile: "root" }
}

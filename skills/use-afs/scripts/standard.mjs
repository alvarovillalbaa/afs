import { existsSync, statSync } from "node:fs"
import path from "node:path"

export const standardDirs = [
  "logs", "lessons", "facts", "facts/general", "fixes", "decisions",
  "steers", "problems", "reflections", "audits", "plans", "specs", "lib",
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

export const removedDirs = ["raw", "sources", "templates", "goals", "models/goals"]

export function resolveWorkspace(input = ".") {
  const originalTarget = path.resolve(input)
  const docs = path.join(originalTarget, "docs")
  const hasShell = (root) => existsSync(path.join(root, "knowledge", "INDEX.md")) ||
    ["SOURCES.md", "REFERENCES.md", "BRAIN.md"].some((file) => existsSync(path.join(root, file)))
  const hasApplicationMarker = ["package.json", "pyproject.toml", "manage.py", "Cargo.toml", "go.mod", "Package.swift"]
    .some((file) => existsSync(path.join(originalTarget, file)))
  const hasDocsSurface = standardDirs.some((name) => {
    const candidate = path.join(docs, name)
    return existsSync(candidate) && statSync(candidate).isDirectory()
  })
  if (!existsSync(path.join(originalTarget, "knowledge", "INDEX.md")) &&
      (hasShell(docs) || (hasApplicationMarker && hasDocsSurface))) {
    return { target: docs, instructionRoot: originalTarget, profile: "docs" }
  }
  return { target: originalTarget, instructionRoot: originalTarget, profile: "root" }
}

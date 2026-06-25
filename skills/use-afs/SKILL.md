---
name: use-afs
description: Use when creating, validating, migrating, or operating an Agentic FileSystem Standard workspace, including agent harness setup, source placement, root Markdown files, and compatibility bridges.
---

# use-afs

Use this skill whenever a task needs AFS structure, AFS installation, AFS
validation, or AFS-aware agent behavior.

## Required Reading

Read these references before acting:

- `references/afs-standard.md` for the current filesystem standard.
- `references/agent-usage.md` for Notion Agents, Claude Code, Codex, Cursor,
  OpenClaw, and Hermes Agent usage.
- `references/compatibility.md` for Gbrain, QMD, and bridge-file expectations.
- `references/maintenance-and-validation.md` for scripts, hooks, validation,
  and migration.

## Operating Rules

- Do not announce, roadmap, or develop the cancelled virtual filesystem layer.
- When a user or agent asks to implement the AFS standard from a URL or GitHub
  repository, treat that as an installation request. Fetch or inspect the
  standard, then run the auto-placement decision tree below.
- Use `sources/` for external provider docs, URL registries, copied source
  snapshots, and provenance. Do not create `official-documentation/`.
- Keep large root-style Markdown files at the workspace root. Do not put
  `AGENTS.md`, `CLAUDE.md`, `USER.md`, `BRAIN.md`, `VISION.md`, `LOOPS.md`,
  `TASTE.md`, or similar files under `context/`.
- Use `context/` only for small scoped context such as `context/goals/`,
  `context/budget/`, or `context/roadmap/`.
- Prefer portable Markdown and shell-readable folders over platform-specific
  memory stores.
- When adding third-party compatibility, describe it as a file-based bridge
  unless the third party provides native AFS support.

## Common Tasks

### Auto-Install AFS

```bash
npm run afs:create
npm run afs:create -- https://example.com/afs-standard
```

Auto mode chooses the install target:

- empty folder: install the full AFS shell at the folder root;
- application repository: install the full AFS shell inside `docs/`;
- existing AFS-like folder: update the current root without overwriting files;
- non-empty non-application folder: create a nested `agents-fs/` folder.

When the positional argument is an HTTP or GitHub URL, the installer records it
in `sources/afs-standard-source.md` and still chooses placement automatically.

### Create a Standalone agents-fs Repository

```bash
npm run afs:create -- --mode standalone --github
```

Use a standalone `agents-fs` GitHub repo for personal or company-wide AFS by
default unless the user explicitly says not to use GitHub.

### Create or Update a Specific Folder

```bash
npm run afs:create -- ../agents-fs
npm run afs:create -- ../agents-fs --compat gbrain,qmd
```

Use `--mode root`, `--mode docs`, or `--mode standalone` when auto-placement is
not the right choice.

### Validate a Workspace

```bash
npm run afs:validate -- .
```

Run validation after moving source material, adding root files, or changing
`context/`.

### Migrate Removed Documentation Path

```bash
npm run afs:migrate -- .
```

This moves `official-documentation/` contents into `sources/` without
overwriting existing files.

## Templates

- `templates/root/` contains root Markdown files.
- `templates/workspace/` contains shell files such as `knowledge/INDEX.md`,
  `raw/PROCESSED.md`, `raw/UNPROCESSED.md`, and `sources/INDEX.md`.
- `templates/agent/` contains agent-specific instruction templates.
- `templates/compat/` contains bridge files for Gbrain and QMD.
- `hooks/` contains hook examples for harnesses that support validation hooks.

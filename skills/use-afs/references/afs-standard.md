# AFS Standard

AFS is a filesystem and Markdown standard for portable agent context.

## Problem

Agent harnesses and platforms store instructions, traces, context, and memory in
different places. That makes useful knowledge hard to move between Codex, Claude
Code, Cursor, Notion Agents, OpenClaw, Hermes, and local tools.

AFS solves the problem by giving agents one portable file structure for:

- Trace history.
- Durable facts and lessons.
- External source provenance.
- Current source-of-truth knowledge.
- Human intent and judgment.

## Installation Profiles

### Standalone `agents-fs`

For a personal brain, company brain, or cross-project operating filesystem, the
default shape is a standalone repository named `agents-fs`. It should normally
be on GitHub so multiple agents and machines can share the same filesystem,
unless the user explicitly says not to use GitHub.

The existing private `alvarovillalbaa/agents-fs` and `clous-ai/agents-fs`
repositories both follow this intent: `BRAIN.md` marks the root, `knowledge/`
contains maintained canonical knowledge, `knowledge/INDEX.md` is the navigation
surface, `raw/` is intake or residual source material, and `sources/` stores
reusable source registries or captured source artifacts.

### Empty or Sparse Folder

If the target folder is empty, install the full AFS shell directly at the root.
If the target folder has only a few non-application files and no application
markers, root install is acceptable.

### Existing Application Repository

If the current folder is a code repository for an application, install the full
AFS shell inside `docs/`. That keeps AFS separated from application source code.
In this profile, `docs/BRAIN.md`, `docs/VISION.md`, `docs/LOOPS.md`, and
`docs/TASTE.md` are the AFS root files for that application.

### Busy Non-Application Folder

If the folder is already populated but is not an application repo and is not
clearly an AFS root, create a nested `agents-fs/` folder.

### URL or GitHub Prompt

If an agent is told to "implement AFS", "implement this AFS standard URL", or
given the AFS GitHub URL, it should treat the prompt as an installation request,
inspect the current workspace, and choose the safest profile automatically.

## Removed Path

Do not create or document `official-documentation/`.

External provider documentation, copied docs, source snapshots, URL registries,
and provenance belong in `sources/`.

## Core Folders

### Memory

- `logs/`
- `lessons/`
- `items/`
- `fixes/`
- `steers/`
- `models/`
- `reflections/`

### Operational

- `audits/`
- `raw/`
- `plans/`
- `specs/`
- `lib/`
- `objects/<type>/`
- domain-specific folders when they are justified

### Source of Truth

- `sources/`
- `references/`
- `cookbook/`
- `knowledge/`
- `runbooks/`
- `research/`
- `context/`

## Context Rule

`context/` is for small scoped context, not large root-style Markdown files.

Keep these at the workspace root:

- `AGENTS.md`
- `CLAUDE.md`
- `USER.md`
- `BRAIN.md`
- `MEMORY.md`
- `PLAYBOOK.md`
- `VISION.md`
- `LOOPS.md`
- `TASTE.md`
- `DESIGN.md`
- `PRODUCT.md`
- `COMPANY.md`
- `VALUES.md`
- `ICP.md`
- `VOICE.md`
- `FRICTION.md`
- `PREDICTION.md`
- `REGRESSIONS.md`
- `HEARTBEAT.md`

## New Root Files

### `VISION.md`

Defines the north star, current direction, non-goals, strategic constraints,
and what agents should protect over time.

### `LOOPS.md`

Defines recurring agent loops, triggers, cadence, review gates, stop
conditions, and improvement cycles.

### `TASTE.md`

Captures high-quality and personalized judgment: what good looks like,
preferred examples, anti-patterns, and subjective standards.

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
In this profile, `docs/BRAIN.md`, `docs/VISION.md`, `docs/LOOPS.md`,
`docs/TASTE.md`, and `docs/GAPS.md` are the AFS root files for that
application.

### Busy Non-Application Folder

If the folder is already populated but is not an application repo and is not
clearly an AFS root, create a nested `agents-fs/` folder.

### URL or GitHub Prompt

If an agent is told to "implement AFS", "implement this AFS standard URL", or
given the AFS GitHub URL, it should treat the prompt as an installation request,
inspect the current workspace, and choose the safest profile automatically.

## Removed Paths

Do not create or document `official-documentation/`.

External provider documentation, copied docs, source snapshots, URL registries,
and provenance belong in `sources/`.

Do not create active top-level `items/` or `cookbook/` paths. Legacy `items/`
content belongs in `facts/items/general/`; legacy `cookbook/` content belongs in
`cookbooks/`.

Do not create active domain-first fact paths such as `facts/general/items/`.
Fact paths are type-first: `facts/items/<domain>/`,
`facts/episodes/<domain>/`, and `facts/triples/<domain>/`.

Do not create active `context/` folders. Root-style Markdown files belong at the
workspace root, and scoped durable information belongs in the appropriate AFS
folder below.

## Core Folders

### Memory

- `logs/` — brief change logs, two lines max, appended to the latest dated file
  under `YYYY/MM-DD/`, usually `changes.md`.
- `lessons/<domain>/` — lessons learned from experience, organized in
  timestamp folders.
- `facts/items/<domain>/` — live atomic facts and item records.
- `facts/episodes/<domain>/` — live episode records derived from facts.
- `facts/triples/<domain>/` — live subject-predicate-object triples derived
  from facts and episodes.
- `fixes/` — error solutions from things actually fixed, organized in timestamp
  folders.
- `steers/` — traces of work redirected by a human or secondary model,
  organized in timestamp folders.
- `models/decisions/` — live brief records of decisions made.
- `models/problems/` — live brief records of problems encountered.
- `models/goals/` — live brief records of goals set.
- `reflections/` — detailed platform, project, workflow, or agent-behavior
  reflections, organized in timestamp folders.

### Operational

- `audits/` — comprehensive reports and analytical audits, organized in
  timestamp folders.
- `raw/` — raw data to be ingested, processed, promoted into `knowledge/` or
  another canonical destination, then removed or marked as done.
- `<domain>/<folder>/` — additional domain-specific paths, such as `health/` or
  `investing/`, when justified.
- `plans/` — implementation plans and plan-driven-development artifacts,
  organized in timestamp folders.
- `specs/` — live desired-state documentation, primarily human-defined.
- `sources/` — URL-based sources to continuously monitor, extract, compile, and
  organize into knowledge additions.
- `lib/` — generated content, drafts, registries, indexes, and reusable support
  artifacts.
- `objects/<type>/` — structured object records, such as clients or employees.
- `templates/` — reusable templates such as prompts, emails, and scripts.
- `results/` — results from work that was run and needs to be preserved,
  organized in timestamp folders.

### Source of Truth

- `references/` — code, URL, API, schema, and technical references as live
  documentation.
- `cookbooks/` — technical guides for how something is actually done in the
  codebase or operating environment.
- `knowledge/` — timeless maintained knowledge about the codebase, business, or
  how to do something.
- `runbooks/` — operational procedures for recurring work after it has been
  performed in a known way.
- `research/` — continuous research related to software engineering topics.

## Timestamp Rule

Timestamped folders use `YYYY/MM-DD/`. Markdown files inside timestamped folders
are named by topic rather than by timestamp. For example:

- `logs/2026/06-29/changes.md`
- `lessons/frontend/2026/06-29/component-boundaries.md`
- `fixes/2026/06-29/build-cache-error.md`
- `results/2026/06-29/evaluation-run.md`

Live folders do not use timestamp folders. This includes `specs/`,
`facts/items/<domain>/`, `facts/episodes/<domain>/`,
`facts/triples/<domain>/`, `models/decisions/`, `models/problems/`,
`models/goals/`, `references/`, `cookbooks/`, `knowledge/`, `runbooks/`, and
`research/`.

## Root File Rule

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
- `GAPS.md`
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

### `GAPS.md`

Tracks gaps in human or agent understanding so unresolved questions stay visible
until an AI agent or human can resolve them into `knowledge/`, `references/`,
`cookbooks/`, `runbooks/`, `research/`, `results/`, or another durable source
of truth.

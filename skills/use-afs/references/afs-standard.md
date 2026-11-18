# AFS Standard

Last updated: 2026-10-10

AFS is a portable filesystem and Markdown standard for agent instructions,
durable knowledge, work history, and source provenance.

## Placement

Personal and company workspaces use a standalone private `agents-fs` repository.
Application repositories put the AFS folders in `docs/`; their root instruction
files, including `AGENTS.md`, `REFERENCES.md`, `SOURCES.md`, and `GAPS.md`,
stay at the repository root. Empty folders use the root. Busy non-application
folders may use a nested `agents-fs/`.

## Folder documentation

Use the smallest set that explains the folder.

- Core: `README.md`, `ARCHITECTURE.md`, `TESTS.md`.
- Conditional: `SETUP.md`, `CHANGELOG.md`, `SECURITY.md`.
- Rare: `OVERVIEW.md`, `FAQ.md`, `DEPENDENCIES.md`.

Recurring procedures belong in `runbooks/`; decisions belong in `decisions/`.
Do not create folder-level `RUNBOOK.md` or `DECISIONS.md`.

## Root files

| File | Ownership |
|---|---|
| AGENTS.md | Agent operating rules, repository conventions, AFS management, source priority, architecture boundaries, verification, and human collaboration |
| SOUL.md | Personality, attitude, tone, decision posture, collaboration principles, and risk tolerance |
| USER.md | User context, preferences, goals, constraints, and working style |
| DESIGN.md | Visual and interaction principles, component rules, typography, color, spacing, states, and UX standards |
| PRODUCT.md | Product vision, users, value proposition, use cases, boundaries, and direction |
| COMPANY.md | Company vision, mission, positioning, operating context, business model, culture, and priorities |
| VALUES.md | Values for the user, company, product, and codebase |
| ICP.md | Customer vision, segments, buyer personas, pains, outcomes, triggers, objections, qualification, and non-fit |
| VOICE.md | Communication style, vocabulary, messaging, banned phrases, and examples |
| HEARTBEAT.md | Current status, priorities, blockers, recent progress, next actions, health, and reporting cadence |
| ROADMAP.md | Short to long term direction, sequencing, and links to canonical Notion goals |
| TASTE.md | Judgment, examples of quality, preferences, and anti-patterns |
| BEHAVIOR.md | Agent behavior, action and stopping rules, collaboration, and escalation |
| IEP.md | Ideal employee profile, capabilities, values, and non-fit |
| REFERENCES.md | One reference catalog with labeled links, navigation anchors, and lookup context |
| SOURCES.md | One provenance and source-monitoring registry, including origin, source URL or Drive artifact, capture status, and compiled destinations |
| GAPS.md | Unresolved gaps in understanding, their impact, owners, and resolution evidence |

Existing harness bridges such as `CLAUDE.md` and supplementary `LOOPS.md`,
`MEMORY.md`, `PLAYBOOK.md`, `PLAN.md`, and `SPEC.md` may remain when useful.
They must route into the current owners rather than duplicate them.

## Memory

- `logs/`: entries of at most two lines per change, appended to the latest
  dated topic file. Also records conversational/action history, patterns, and friction.
- `lessons/<domain>/`: lessons from experience, in timestamp folders.
- `facts/<domain>/`: living factual documentation, without timestamp folders.
- `fixes/`: actual errors, solutions, regression risks, and prevention evidence,
  in timestamp folders.
- `decisions/`: brief living decision records, without timestamp folders.

Existing `steers/`, `problems/`, and `reflections/` may remain as scoped
history or problem records. They do not create a separate goal system.

## Operational

- `audits/`: comprehensive reports and analytical audits, in timestamp folders.
- `<domain>/<folder>/`: justified domain-specific content, such as health or investing.
- `plans/`: implementation plans, in timestamp folders.
- `specs/`: living desired-state specifications, mainly human-defined; AI edits
  require task authority.
- `lib/`: generated content, drafts, and reusable support artifacts.
- `objects/<type>/`: structured records such as clients or employees.
- `results/`: preserved results of completed work, in timestamp folders.

## Source of truth

- `cookbooks/`: technical guides explaining how something is actually done.
- `knowledge/`: unique knowledge, original perspectives, and source-backed
  synthesis that generalizes across areas. It is not a mirror of online material
  and does not define operations. Procedures belong in runbooks or cookbooks;
  product, company, user, and audience intent belongs in the matching root file.
- `runbooks/`: recurring operational procedures grounded in prior execution.
- `research/<unit>/`: continuous research organized as distinct research units.

Each research unit has a `README.md` defining:
1. Questions and their order of investigation.
2. Hypotheses, with uncertainty stated.
3. Reasoning and motivation.
4. Method, scope, evidence criteria, and stopping/review conditions.
5. Evidence, results, status, next questions, and an owner when known.

Research folders are living, not organized primarily by dates. Dated observations
can remain within a unit as evidence. Do not invent hypotheses or claim research
was performed to fill a template.

## External owners

Raw data and source captures live in Google Drive: personal material in
`alvaro.villalbaperez@gmail.com`; Clous material in `avillalba@clous.app`.
`SOURCES.md` records verified artifact links, source identity, capture status,
checksums when migrated, and destinations of any unique synthesis. An archived
copy is preservation evidence, not proof of ingestion.

Goals live in Notion, guided by `ROADMAP.md`. The roadmap links to those goal
records rather than maintaining a competing goal database.

Templates live beside the content they generate, such as
`lib/videos/template.md`, or within the corresponding Drive/Figma content
folder. Application runtime templates and skill-local template assets remain
with their owning content/component.

## Removed surfaces and migration

| Removed surface | Current owner |
|---|---|
| FRICTION.md | Brief dated logs |
| PREDICTION.md | Relevant research unit, plan, spec, or roadmap |
| REGRESSIONS.md | Dated fixes with regression-prevention evidence |
| BRAIN.md | AGENTS.md |
| VISION.md | COMPANY.md, PRODUCT.md, ICP.md, or another relevant owner |
| FOCUS.md | ROADMAP.md |
| RUNBOOK.md | runbooks/ |
| DECISIONS.md | decisions/ |
| goals/ and models/goals/ | Canonical Notion goals and ROADMAP.md links |
| raw/ | The correct personal or Clous Google Drive |
| sources/ | SOURCES.md; copied artifacts move to Drive |
| External reference registries in references/ | REFERENCES.md for the AFS reference catalog |
| templates/ | The folder that owns the generated content |

Do not delete unread source entries or remove local artifacts before a verified,
recoverable Drive copy exists. Preserve contents, original paths, external URLs,
status tags, and source identifiers. Do not move application assets merely
because their folder name resembles an AFS surface.

Existing technical owner guides may retain repository-native paths such as
`docs/references/`. REFERENCES.md catalogs those guides; a technical contract
or cookbook is different from a duplicate external-link registry. Do not move
code/CI-pinned guides merely to match a directory name.

## Dates and provenance

Timestamp folders use `YYYY/MM-DD/`; topic files have descriptive names.
Timestamped: logs, lessons, fixes, audits, plans, results, and existing steering
or reflection records. Living: facts, decisions, specs, cookbooks, knowledge,
runbooks, research, and root files.

Every non-obvious claim needs evidence. Record unread or inaccessible sources
as such in `SOURCES.md` and unresolved understanding in `GAPS.md`.

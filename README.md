# AFS

AFS is the Agentic FileSystem Standard: a portable filesystem and Markdown
structure for agent context, traces, source provenance, and durable knowledge.

The problem is simple: agent harnesses and platforms keep useful information in
disconnected places. AFS gives agents one shared way to read and write context
that can move between Codex, Claude Code, Cursor, Notion Agents, OpenClaw,
Hermes Agent, and plain local tools.

## Standard

AFS organizes context into three broad surfaces:

- Memory: `logs/`, `lessons/`, `items/`, `fixes/`, `steers/`, `models/`,
  `reflections/`.
- Operational work: `audits/`, `raw/`, `plans/`, `specs/`, `lib/`, `objects/`,
  and justified domain folders.
- Source of truth: `sources/`, `references/`, `cookbook/`, `knowledge/`,
  `runbooks/`, `research/`, `context/`.

External provider docs, copied source material, URLs, source snapshots, and
provenance belong in `sources/`.

`context/` is only for lightweight scoped context. Large root-style Markdown
files such as `AGENTS.md`, `USER.md`, `VISION.md`, `LOOPS.md`, and `TASTE.md`
belong at the root of an AFS workspace.

## use-afs

The standard ships with a repo skill at `skills/use-afs`:

- `SKILL.md` and references for agents.
- Scaffold, validation, and migration scripts.
- Root templates, agent templates, bridge templates, and hook examples.
- Best-effort compatibility bridges for Gbrain and QMD.

## Commands

```bash
npm run afs:create
npm run afs:create -- https://example.com/afs-standard
npm run afs:create -- --mode standalone --github
npm run afs:create -- ../agents-fs --compat gbrain,qmd
npm run afs:create -- --mode docs
npm run afs:validate -- .
npm run afs:migrate -- .
```

Install behavior:

- Empty or sparse folders get the full AFS shell at root.
- Application repositories get the full AFS shell inside `docs/`.
- Personal or company AFS workspaces should normally be standalone private
  GitHub repos named `agents-fs`.
- Busy non-application folders get a nested `agents-fs/` folder.
- Agents given the AFS standard URL or GitHub URL should treat it as an
  installation request and choose the safest profile automatically.

## Website

This repository also contains the AFS website.

```bash
npm run dev
npm run lint
npm run build
```

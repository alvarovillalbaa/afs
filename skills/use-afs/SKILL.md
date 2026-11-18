---
name: use-afs
description: Create, validate, migrate, or operate an Agentic FileSystem Standard workspace, including root instructions, research units, source provenance, and agent harness bridges.
---

# use-afs

Read `references/afs-standard.md`, `references/agent-usage.md`,
`references/compatibility.md`, and `references/maintenance-and-validation.md`
before acting. The user's current instructions override earlier standard versions.

## Contract

- `AGENTS.md` owns agent rules and AFS management.
- Root Markdown stays at the repository root; application AFS folders live in `docs/`.
- `REFERENCES.md` is the reference catalog; `SOURCES.md` records provenance,
  monitoring, capture/ingestion status, and verified Drive artifact links.
- Raw data belongs in the personal or Clous Google Drive. Preserve unread sources
  and verify a recoverable copy before removing local material.
- Goals belong in Notion and are linked from `ROADMAP.md`.
- Templates stay beside the content they generate.
- Use living `facts/<domain>/` and `decisions/`.
- Use `YYYY/MM-DD/` for logs, lessons, fixes, audits, plans, and results.
- `knowledge/` contains unique knowledge and perspectives, not copied online
  content or operational definitions.
- Continuous research lives in `research/<unit>/`, with ordered questions,
  hypotheses, reasoning, method, and evidence/status in each unit's README.
- Record friction in logs, regression prevention in fixes, vision in the relevant
  company/product/customer file, and unresolved understanding in `GAPS.md`.
- Do not announce or develop the cancelled virtual filesystem layer.
- Keep harness bridges honest about their file-based support.

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

Inspect before choosing placement or migrating. Preserve existing content,
links, tags, and provenance. Do not infer ingestion from a successful move.

## Assets

`templates/root/` contains root instruction templates.
`templates/workspace/` contains the current shell's navigation and guidance.
`templates/agent/`, `templates/compat/`, and `hooks/` are skill-owned assets;
they are not global AFS template folders.

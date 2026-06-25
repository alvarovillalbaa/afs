# Agent Instructions

This workspace follows the Agentic FileSystem Standard.

## Read Order

1. Read `BRAIN.md` when present for AFS management rules.
2. Read `VISION.md`, `LOOPS.md`, and `TASTE.md` before strategic or subjective
   work.
3. Read relevant source-of-truth folders: `sources/`, `references/`,
   `knowledge/`, `cookbook/`, `runbooks/`, and `research/`.
4. Read memory folders only when history matters: `logs/`, `lessons/`,
   `items/`, `fixes/`, `steers/`, `models/`, and `reflections/`.

## Write Rules

- Put external docs, URLs, copied source material, and provenance in `sources/`.
- Do not create `official-documentation/`.
- Keep large root-style Markdown files at the workspace root, not in `context/`.
- Use `context/` only for small scoped subfolders.
- Run `npm run afs:validate -- .` after structural changes when this repository
  has the `skills/use-afs` scripts installed.

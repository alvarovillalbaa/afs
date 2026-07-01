# Agent Instructions

This workspace follows the Agentic FileSystem Standard.

## Read Order

1. Read `BRAIN.md` when present for AFS management rules.
2. Read `VISION.md`, `LOOPS.md`, `TASTE.md`, and `GAPS.md` before strategic,
   subjective, research, or knowledge work.
3. Read relevant source-of-truth folders: `references/`, `knowledge/`,
   `cookbooks/`, `runbooks/`, and `research/`.
4. Read memory folders only when history matters: `logs/`, `lessons/`,
   `facts/`, `fixes/`, `steers/`, `models/`, and `reflections/`.

## Write Rules

- Put external docs, URLs, copied source material, and provenance in `sources/`.
- Do not create `official-documentation/`.
- Put live fact records in `facts/items/<domain>/`,
  `facts/episodes/<domain>/`, and `facts/triples/<domain>/`.
- Put work results that need to be preserved in `results/YYYY/MM-DD/`.
- Put unresolved gaps in understanding in `GAPS.md` so humans and agents can
  resolve them deliberately.
- Put technical how-to guides in `cookbooks/`, not `cookbook/`.
- Put decision, problem, and goal records in `models/decisions/`,
  `models/problems/`, and `models/goals/`.
- Use timestamp folders shaped as `YYYY/MM-DD/` for logs, lessons, fixes,
  steers, reflections, audits, plans, and results.
- Keep large root-style Markdown files at the workspace root, not in `context/`.
- Treat `context/` as a legacy/deprecated path, not an active AFS surface.
- Run `npm run afs:validate -- .` after structural changes when this repository
  has the `skills/use-afs` scripts installed.

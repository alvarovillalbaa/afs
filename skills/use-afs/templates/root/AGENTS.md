# Agent Instructions

This workspace follows the Agentic FileSystem Standard.

## Read Order

1. Read this file for agent operating rules and AFS management.
2. Read the relevant `COMPANY.md`, `PRODUCT.md`, `ICP.md`, `ROADMAP.md`, `LOOPS.md`, `TASTE.md`, and `GAPS.md` before strategic,
   subjective, research, or knowledge work.
3. Read `REFERENCES.md`, `SOURCES.md`, and relevant source-of-truth folders: `knowledge/`,
   `cookbooks/`, `runbooks/`, and `research/`.
4. Read memory folders only when history matters: `logs/`, `lessons/`,
   `facts/`, `fixes/`, `steers/`, `decisions/`, and `reflections/`.

## Write Rules

- Keep reference links in `REFERENCES.md` and provenance/capture status in `SOURCES.md`.
- Keep raw material in the correct personal or Clous Google Drive. Verify a recoverable copy before removing an existing local artifact.
- Do not create `official-documentation/`.
- Put live fact records in `facts/<domain>/`, without timestamp folders.
- Put work results that need to be preserved in `results/YYYY/MM-DD/`.
- Put unresolved gaps in understanding in `GAPS.md` so humans and agents can
  resolve them deliberately.
- Put technical how-to guides in `cookbooks/`, not `cookbook/`.
- Put decisions in `decisions/`; goals are canonical in Notion and linked from `ROADMAP.md`.
- Keep templates beside the content they generate, rather than in a global template folder.
- Keep unique knowledge and perspectives in `knowledge/`; operations belong in runbooks or cookbooks.
- Organize continuous research in `research/<unit>/`, defining ordered questions, hypotheses, reasoning, method, and evidence/status in each unit's README.
- Record friction in brief logs and regression prevention with the corresponding fix.
- Use timestamp folders shaped as `YYYY/MM-DD/` for logs, lessons, fixes,
  steers, reflections, audits, plans, and results.
- Keep large root-style Markdown files at the workspace root, not in `context/`.
- Treat `context/` as a legacy/deprecated path, not an active AFS surface.
- Preserve unread source links and mark missing understanding in `GAPS.md`; never claim uninspected sources were ingested.
- Run `npm run afs:validate -- .` after structural changes when this repository
  has the `skills/use-afs` scripts installed.

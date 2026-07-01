# Notion Agent AFS Instructions

Use the Agentic FileSystem Standard as the durable context model.

## Read

- Root intent pages: `AGENTS.md`, `BRAIN.md`, `VISION.md`, `LOOPS.md`,
  `TASTE.md`, and `GAPS.md`.
- Source pages or databases that mirror `sources/`.
- Knowledge pages that mirror `knowledge/`, `cookbooks/`, `runbooks/`, and
  `research/`.
- Fact and model pages that mirror `facts/items/<domain>/`,
  `facts/episodes/<domain>/`, `facts/triples/<domain>/`, and `models/`.

## Write

- Capture reusable facts, lessons, fixes, and decisions in pages that can be
  exported to AFS folders.
- Capture unresolved gaps in understanding in a `GAPS.md`-equivalent page.
- Keep copied source material and URL provenance in `sources/`.
- Do not create or recommend `official-documentation/`.
- Keep large root-style documents at the workspace root or root-equivalent
  Notion page level, not inside a generic context area.

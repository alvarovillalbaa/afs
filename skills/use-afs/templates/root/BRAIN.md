# AFS Brain

This file defines how the AFS workspace should be managed.

## Management Rules

- Keep durable context in portable Markdown files.
- Keep source provenance in `sources/`.
- Promote repeated lessons into source-of-truth folders.
- Keep agent-specific settings thin and route durable instructions back to AFS.
- Prefer small, useful updates over broad unsourced rewrites.

## Promotion Rules

- `raw/` becomes `knowledge/`, `references/`, or `sources/` after review.
- User, company, or object facts become live records under
  `facts/items/<domain>/`, `facts/episodes/<domain>/`, or
  `facts/triples/<domain>/`.
- Repeated fixes become `fixes/` or `cookbooks/`.
- Preserved outputs from completed work become timestamped `results/`.
- Unresolved gaps in human or agent understanding become `GAPS.md` entries
  until they are resolved into durable knowledge.
- Repeated operational procedures become `runbooks/`.
- Decisions, encountered problems, and goals become live records under
  `models/decisions/`, `models/problems/`, and `models/goals/`.
- Strategic changes update root files such as `VISION.md`, `LOOPS.md`,
  `TASTE.md`, or `GAPS.md`.

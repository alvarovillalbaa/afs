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
- Repeated fixes become `fixes/` or `cookbook/`.
- Repeated operational procedures become `runbooks/`.
- Strategic changes update root files such as `VISION.md`, `LOOPS.md`, or
  `TASTE.md`.

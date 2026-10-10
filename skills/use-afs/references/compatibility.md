# Compatibility

AFS compatibility should be honest and file-based by default.

## Gbrain by Garry Tan

Support status: best-effort bridge.

Use `templates/compat/GBRAIN.md` when a workspace wants to expose a Gbrain-style
entry point. The bridge should point back to:

- `AGENTS.md`
- `ROADMAP.md`
- `LOOPS.md`
- `TASTE.md`
- `GAPS.md`
- `SOURCES.md` and `REFERENCES.md`
- `knowledge/`

Do not describe this as native or official support unless Gbrain publishes an
AFS integration.

## QMD by Toby at Shopify

Support status: best-effort bridge.

Use `templates/compat/QMD.md` when a workspace wants a query and decision
surface that maps back to AFS. The bridge should point to:

- `specs/`
- `plans/`
- `GAPS.md`
- `knowledge/`
- `research/`
- `SOURCES.md` and `REFERENCES.md`

Do not describe this as native or official support unless QMD publishes an AFS
integration.

## Generic Harnesses

Any harness that can read files and write Markdown can use AFS:

1. Read root files first.
2. Read relevant path groups.
3. Write traces into memory folders.
4. Write external provenance into `SOURCES.md` and retain source artifacts in the correct Google Drive.
5. Promote stable truth into `knowledge/`, `cookbooks/`, `runbooks/`,
   `research/`, or root files.

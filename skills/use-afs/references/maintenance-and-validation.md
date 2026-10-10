# Maintenance and Validation

Last updated: 2026-10-10

## Create

`npm run afs:create` chooses root, application `docs/`, or standalone
`agents-fs/` placement. Root instruction files stay at the repository root in
every profile. Existing files are preserved. A URL argument is recorded in
`SOURCES.md`. Standalone workspaces can use `--github` after the user
authorizes repository publication.

## Validate

`npm run afs:validate -- .` checks the detected AFS shell. It rejects removed
root files and global raw, source, reference, goal, and template surfaces.
It requires root `AGENTS.md`, `REFERENCES.md`, `SOURCES.md`, and `GAPS.md`.
Each research unit must define ordered questions, hypotheses, reasoning, method,
and evidence/status. Missing optional shell folders and undated history produce
warnings; a warning is not proof of completed migration.

## Migrate

`npm run afs:migrate -- .` consolidates obsolete root files and text registries
without overwriting content. Conflicting names receive a migration suffix.
The command reports blockers for raw/binary material needing verified Drive
export, goals needing Notion routing, or templates needing a content owner.
Review these blockers; do not treat a partial migration as complete.

After a verified export, record its artifact link, original source paths,
checksums, account, and capture status in `SOURCES.md` before removing the
corresponding local material. Never label preservation as ingestion.

## Hooks

Hooks remain optional harness adapters. Run structural validation after changes
and inspect the output. Do not change a harness's permissions or security gates
to make a structural check pass.

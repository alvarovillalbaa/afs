# Maintenance and Validation

Last updated: 2026-10-10

## Create

`npm run afs:create` chooses root, application `docs/`, or standalone
`agents-fs/` placement. Root instruction files stay at the repository root in
every profile. Existing files are preserved. A URL argument is recorded in
`SOURCES.md`. Standalone workspaces can use `--github` after the user
authorizes repository publication.

New installs record their placement in `.afs-profile.json`. Detection also
recognizes an existing AFS knowledge index or the legacy docs instruction shell;
a generic docs catalog or application manifest alone is insufficient. Use
`--mode=docs` or `--mode=root` with validation/migration after inspecting an
otherwise ambiguous workspace. Generated application instructions prefix AFS
folders with `docs/` while keeping root registries at the repository root.
Migration records a detected docs profile before retiring the legacy documents
used to detect it, so retries and validation keep checking the same shell.

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

Registry content is selected explicitly after review, for example:
`npm run afs:migrate -- . --registry=references/external-links.md`.
Repeat `--registry=...` for additional files, using paths relative to the
instruction root (`docs/references/...` in the application profile).
Unselected Markdown snapshots and repository-native technical guides remain
in place with blockers and are excluded from automatic inbound-link edits.
The same byte-preservation boundary covers retained raw, official-documentation,
goal, model, global-template and type-first fact trees under the selected AFS
target. Explicitly selected registry jobs still consolidate and rebase their own
content. Retained captures can contain obsolete paths; update maintained
navigation separately instead of altering unreviewed evidence.
A Markdown suffix does not establish registry ownership
or verified external preservation. Type-first `facts/items`, `facts/episodes`
and `facts/triples` also remain blocked for content-owner review.

The scripts reject symlink sources, destinations and path components within
the selected workspace, including dangling links. Migration refuses invalid
UTF-8 rather than replacing source bytes. Consolidated entries retain stable
anchors, heading targets and retry markers; a partial or changed marked entry
requires review before source retirement. Directory moves rebase inbound and
internal Markdown links using their actual conflict-resolved destinations.
Reference-style definitions are rebased alongside inline links, retaining titles
and consolidated-entry anchors. Required root documents must be regular files.
Consolidation gives each entry its own reference/footnote labels and explicit
HTML anchor IDs, including local fragment links. Filename path segments retain
URL escaping for reserved characters. Review the resulting navigation after
migration; these checks do not replace content-specific review.
Link rebasing shares the literal-aware reference traversal: inline, fenced and
indented code examples remain unchanged in the exercised cases. Actual inline
destinations support balanced or escaped parentheses, preserving their titles.
Relative HTML `href`, `src`, `poster` and `xlink:href` attributes use the same
relocation mappings. Rewritten attributes are quoted. Markdown and HTML URL
character references use the [complete bundled reference data](html-character-references.md),
with their respective escape/semicolon rules and one-pass decoding. Unknown
names remain literal; decoded URL whitespace is normalized before classification.
Comments remain literal during link rebasing. Workspace skill documents and
their templates are included in inbound navigation updates; only the installed
AFS package's own template tree and generated dependencies are excluded.
Heading anchors respect the opening fence's character, length and closing rules.
Their slugs use displayed heading prose: character references are decoded while
escaped punctuation and inline code retain their literal meaning, including
duplicate-heading suffixes. Matched asterisk and underscore emphasis delimiters
are removed before slugging; unmatched, intraword, escaped, code and
entity-produced underscores remain literal.
Suffix allocation checks every heading ID already generated for the entry, so
literal numbered headings cannot collide with suffixes assigned to duplicates.
Text transformations and retry-marker checks are prepared for the full plan
before source retirement, including directory content and inbound documents.
Text originals are retired after planned link rewrites pass readback. Fully
admitted directory roots retain direct navigation, including `.` and `./` links.
An EOF-terminated code fence is closed at the consolidated entry boundary so
later entries retain their rendered meaning. This is not an atomic filesystem
transaction; I/O failures and concurrent writers still require owner review.
Run these tools with exclusive workspace ownership: path checks and moves do
not provide isolation from concurrent writers.

After a verified export, record its artifact link, original source paths,
checksums, account, and capture status in `SOURCES.md` before removing the
corresponding local material. Never label preservation as ingestion.

## Hooks

Hooks remain optional harness adapters. Run structural validation after changes
and inspect the output. Do not change a harness's permissions or security gates
to make a structural check pass.

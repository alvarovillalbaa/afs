# Maintenance and Validation

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

## Create Rules

`afs:create` defaults to auto-placement:

- empty target folder: install the full AFS shell at root;
- application repository: install the full AFS shell inside `docs/`;
- existing AFS-like folder: update root without overwriting files;
- populated non-application folder: create a nested `agents-fs/`;
- explicit `--mode root`, `--mode docs`, or `--mode standalone` overrides the
  heuristic.
- HTTP and GitHub URL arguments are treated as installation source URLs. The URL
  is recorded in `sources/afs-standard-source.md`; placement remains automatic.

Standalone personal and company AFS installs should normally be initialized as a
GitHub repository named `agents-fs`. The script initializes local Git for
standalone installs and can create the GitHub repo with `--github` when `gh` is
installed and authenticated.

## Validation Rules

Validation fails when:

- `official-documentation/` exists.
- top-level `items/` exists.
- top-level `cookbook/` exists.
- domain-first facts such as `facts/company/items/` exist.
- A root-style Markdown file exists under `context/`.
- A Markdown file larger than the configured context threshold exists under
  `context/`.

Validation warns when:

- `sources/` is missing.
- `context/` exists.
- Recommended root files such as `AGENTS.md`, `BRAIN.md`, `VISION.md`,
  `LOOPS.md`, `TASTE.md`, and `GAPS.md` are missing.
- `knowledge/INDEX.md`, `raw/PROCESSED.md`, `raw/UNPROCESSED.md`, or
  `sources/INDEX.md` are missing.
- Recommended `facts/{items,episodes,triples}/general/` or
  `models/{decisions,problems,goals}/` live folders are missing.
- Timestamped folder categories, including `results/`, contain Markdown
  directly at the category root instead of under `YYYY/MM-DD/`.

When validation is run from an application repository that has `docs/BRAIN.md`,
the validator treats `docs/` as the AFS root.

## Migration Rule

`afs:migrate` moves children of `official-documentation/` into `sources/`
without overwriting existing files. If a name conflict exists, the migrated file
or folder receives a `-migrated` suffix.

The same command also moves legacy `items/` into `facts/items/general/`,
legacy `cookbook/` into `cookbooks/`, and domain-first facts such as
`facts/general/items/` into `facts/items/general/` with the same no-overwrite
conflict rule.

## Hook Usage

Hooks are optional. Use them only in harnesses that support local validation
commands. The examples in `hooks/` are deliberately stored as examples because
each harness can evolve its hook schema independently.

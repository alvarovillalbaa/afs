# Migration preservation review

AFS PR [#1](https://github.com/alvarovillalbaa/afs/pull/1) had 22 unresolved
review findings on `c0173467b840cf7dd1491ccbfb3ea5b568208aaf`.
The correction preserves the intended ownership migration while retaining
unreviewed source material and refusing unsafe filesystem destinations.

A subsequent [three-finding follow-up](followup-1/README.md) reproduces and fixes
reference definitions, persistence of legacy docs detection and mandatory
document types. Its latest verification passes 27 focused tests; the original
24-test run below remains preserved as historical evidence.

The [finding inventory](findings.json) and [coverage map](coverage.json) bind
each original review comment to a behavioral regression case. Remote review
resolution, CI and merge are separate subsequent steps.

## Resulting behavior

- Creator and migrator check workspace path components, including dangling
  links, before writing or retiring content. Symlinked registry and legacy
  directory roots are never traversed for migration.
- Only explicitly reviewed `--registry=...` files are consolidated. Source
  snapshots, technical guides and unclassified type-first facts remain blocked
  for their owner. Registry subdirectories named `skills` are inspected.
- Text consolidation refuses invalid UTF-8. Marked complete appends can be
  retried without duplication; partial entries or changed original versions
  retain the source for review.
- Directory moves reserve actual conflict destinations before links are
  rewritten. Consolidated entries receive distinct anchors; inline Markdown
  titles and heading fragments retain their targets.
- Recorded profiles and legacy AFS structure determine placement. Generic
  application manifests/catalogs do not select a docs migration. Fresh docs
  instructions prefix owned folders, legacy docs root templates consolidate at
  the instruction root, and conflicting explicit profile changes stop early.
- Validation covers legacy problem/fact surfaces, root legacy documentation,
  domain lesson dates and all unscoped research files. Empty registry migrations
  still initialize the required root catalogs.

Node documents the [link metadata operation](https://nodejs.org/api/fs.html#fspromiseslstatpath-options)
and [strict decoding options](https://nodejs.org/api/util.html#new-textdecoderencoding-options)
used here. Checks are not isolation from concurrent writers; migration requires
exclusive workspace ownership and subsequent content/link review.

## Verification

The [final run](final-verification.json) passes all 24 focused Node tests on
Node v26.8.2, syntax checks for all four scripts and the test file, and
`git diff --check`. No new synthetic fixture residue remained. The dirty primary
checkout's HEAD, complete status, binary diff and Git index remained unchanged.
Tests executed only synthetic fixtures, including synthetic external siblings;
no real workspace was migrated.

The [negative ablation](ablation.json) temporarily bypassed the path guard,
strict decoding and reviewed-registry gate. All four selected safety tests
failed; the protections were restored exactly before subsequent positive runs.
The [initial verification](verification.json) and [post-ablation run](post-ablation-verification.json)
retain earlier results, including the corrected overlapping lesson assertion.

Fresh-base review used main `76caffaaaea6766cffbbd2b1153bd950be1acb54` and
applied code quality, failure reporting, behavioral coverage and documentation
accuracy lenses. It additionally found and corrected planned-destination
collisions, partial/changed source retries and profile-marker conflicts.
There is no new typed model. This is a local review, not independent hosted
acceptance or a full Markdown parser certification.

The optional external `deslop`, `thermo-nuclear-code-quality-review` and
`no-mistakes` skills were absent from the inspected user skill roots. They were
not installed. The PR skill's fallback command is
`python3 scripts/install-external-skills.py --skill <name> --agent codex`;
installation was not needed for the bounded local correction and is not claimed.

No dependencies, application builds, browser checks, production/auth/CI
configuration, paused automation state or cloud destination were changed.
Existing source history and administrator acceptance gates remain protected.

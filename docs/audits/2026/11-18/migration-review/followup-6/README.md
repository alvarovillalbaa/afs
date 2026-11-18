# Workspace skills and URL character references

The completed review of `288a55e1eb551c8ba8f5efc4a1954884a1953542` found
[authored workspace skills omitted from inbound rewrites](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615738882)
and [Markdown entity spelling treated as the filename](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615738896).
Both regressions [failed before correction](baseline.json).

Inbound scanning now includes user skill documents and their templates. The
installed AFS package's own template tree is excluded by canonical identity;
dependency/build directories remain excluded. A disposable installed-script
fixture verifies both a rewritten user skill and byte-identical bundled templates,
including macOS temporary-directory aliases.

The shared URL decoder uses [complete WHATWG reference data](../../../../../../skills/use-afs/references/html-character-references.md).
All 2,231 entries and 27 HTML numeric replacements were independently checked
against Python's standard library. [Source/snapshot hashes and the derivation](reference-data.json)
are retained. This adds repository code and 55,644 bytes of lookup data, no
package dependency or runtime network access. Attribution and the upstream
BSD conditions/disclaimer accompany the data.

Markdown destinations follow cmark URL cleanup: decode character references
once, then unescape punctuation. HTML attributes use their own semicolon and
ambiguous-ampersand rules. URL whitespace normalization precedes classification;
the peer's leading-tab external-URL case [failed before correction](peer-baseline.json).
Rewritten Markdown escapes ampersands and encodes unsafe delimiter characters,
preserving query and fragment interpretation after serialization.

The first [independent rendering attempt](render-baseline.json) contradicted
the initial escaped-entity URL assumption despite passing local tests. Minimal
GitHub rendering and [cmark-gfm source](https://github.com/github/cmark-gfm/blob/master/src/inlines.c)
established the actual order; URL expectations and implementation were corrected.
This distinction applies to destinations, not ordinary prose escapes.

The [current GitHub GFM check](github-render-verification.json) uses four synthetic
requests. Seven named links resolve to observed entry targets, with distinct
named/percent-encoded filenames, preserved query contents, a rewritten workspace
skill and equal code samples. External-link rendering inventory is unchanged;
GitHub sanitizes the exercised angled leading-tab destination to its caption in
both versions. No browser-click acceptance is inferred.

The [final verification](final-verification.json) records 50 focused tests,
six JavaScript syntax checks, whitespace checks, complete reference-data validation
and unchanged dirty-primary HEAD/status/diff/index. An intermediate 49-test run
passed 47: one test fixture needed its emptied directory recreated before writing,
and canonical template identity needed the OS path alias resolved. Both were
corrected, then 49 tests passed; the peer URL case extended the final suite to 50.
The former unsupported-entity test now verifies its valid named destination.
The full-plan failure test now uses an actual partial marker, retaining both
originals and inbound content until a repaired retry succeeds.

Bounded [peer rechecks](peer-review.json) supplement the preceding five-lens
review. Synthetic fixtures were removed. No real downstream migration, full
Markdown/HTML parser certification, atomic filesystem transaction, dependency
installation, website build or production verification is claimed.

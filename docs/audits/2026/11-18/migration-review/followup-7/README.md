# Heading display and migrated targets

The completed review of `f47e8cd2b099657a7faa763d05bedbac9fb76015` found
[entity spelling used instead of displayed heading text](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4616151814).
The five-heading regression matrix [failed before correction](baseline.json).

Heading-text extraction now protects escaped punctuation and complete inline
code spans, removes display-only link/tag markup from prose, decodes character
references and restores literal spans before slugging. Code-span delimiting is
shared with the existing literal-aware link traversal. Duplicate counts are based
on the resulting displayed slug, preserving the original fragment suffixes.

The [final verification](final-verification.json) passes 51 focused Node tests,
six JavaScript syntax checks and `git diff --check`; the dirty primary's complete
HEAD/status/diff/index fingerprints remain unchanged. The matrix distinguishes
plain ampersand entities, escaped entity text, literal code, numeric references,
named characters and duplicate headings. Bounded
[peer rechecks](peer-review.json) also cover reference-link headings, nested code
spans, unchanged adjacent code literals, actual link rebasing and stable retry.

The [independent GitHub GFM check](github-render-verification.json) renders the
original and consolidated documents. All five displayed headings match, and each
prefixed incoming fragment has a target in the returned HTML. The original REST
rendering omits automatic heading IDs; an initial assumption otherwise
[failed](render-baseline.json). Original fragment expectations come from the
authored incoming fixture links and the reported ampersand example. Direct
original-page anchor acceptance remains unverified. This is API rendering on
synthetic fixtures, not browser clicking or visual acceptance. Fixtures were removed.
The [small source fixture](source-heading-fixture.md) preserves the exact original
heading input for subsequent page-anchor inspection.

No full Markdown/HTML parser certification, real downstream migration, atomic
filesystem transaction, concurrent-writer isolation, dependency installation,
website build or production verification is claimed.

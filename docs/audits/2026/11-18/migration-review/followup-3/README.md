# Literal-aware link rebasing

The completed review of `710ed791daf9761aa3f0164ce2d7585aa97523af` found two
additional navigation defects. Comments
[4615099793](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615099793)
and [4615099807](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615099807)
describe code literals rewritten before protection and skipped balanced
parentheses in inline destinations. Both regression tests
[failed on that head](baseline.json).

Rebasing now shares the existing literal-aware traversal used for reference
namespacing. Consolidation transforms the original text once; moved and inbound
documents use the same traversal without changing reference labels. Definition
destinations are rebased once, and inline destinations are delimited with
balanced/escaped parentheses or angle brackets. Markdown punctuation escapes
are decoded for filesystem lookup; titles and code literals retain their text.

The [final verification](final-verification.json) records 39 passing focused Node tests,
five JavaScript syntax checks, `git diff --check` and unchanged dirty-primary
HEAD/status/diff/index fingerprints. The two new fixtures exercise consolidation,
moved documents and inbound links, inline/fenced/indented code, titled links,
images, reference definitions and angle-delimited destinations.

The [independent GitHub GFM check](github-render-verification-v2.json) uses five
render requests on synthetic input/output. Three parenthesized links render to
the intended relocated resource with their original titles; the two source
reference labels retain distinct destinations. Rendered inline and fenced code
samples are equal before/after consolidation. The synthetic fixture was removed.
Indented code containing apparent bullet/numbered list markers also remains
literal; the peer reproduction [failed before its correction](peer-baseline.json).
This checks the [documented renderer](https://docs.github.com/en/rest/markdown/markdown#render-a-markdown-document),
not browser clicking or visual acceptance. Relevant syntax is described in
[CommonMark links](https://spec.commonmark.org/0.31.2/#links) and
[code spans](https://spec.commonmark.org/0.31.2/#code-spans).

The preceding five-lens review remains in [followup-2](../followup-2/README.md).
The current [bounded peer rechecks](peer-review.json) found and verified that
additional indentation case, while retaining real list continuation links.
No full Markdown
parser certification, concurrent-writer isolation, real downstream migration,
dependency installation, application build or production verification is claimed.

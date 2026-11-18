# Consolidated navigation review

The completed review of `093bc5371bb68b000a3dfd932b7af58fe6d9aa06` found
three navigation cases, recorded with their regression tests in the
[finding map](findings.json). All three tests [failed before correction](baseline.json).
The [initial corrected run](verification.json) passed 30 focused Node tests.
The [five-lens AI review](peer-review.json) then confirmed further interactions,
reproduced in the [peer baseline](peer-baseline.json), [boundary baseline](peer-boundary-baseline.json)
and [relative-URI baseline](peer-relative-uri-baseline.json). Every reported case
was corrected and rechecked. The [final verification](final-verification.json)
passes 37 focused tests, five JavaScript syntax checks and `git diff --check`.
All dirty-primary fingerprints still match.

Consolidated entries now use distinct reference and footnote labels, preserving
each document's destinations instead of allowing the first definition to win
across documents. Checks cover explicit, collapsed, shortcut and image usages,
case variants, footnotes and reference links containing inline code. Literal
code examples remain unchanged in the exercised inline/fenced cases. Heading
targets are derived from displayed link text rather than the renamed label.

Complete definition data, inline destinations/titles, escaped pairs and code
spans are protected as literals before reference usages are rewritten, then
restored before any original is retired. The scanner distinguishes list and
footnote continuation prose from indented code. Container definitions retain
document-wide ownership. Labels use short entry-local identifiers, including
the exercised maximum-length and Unicode-fold cases.

Rebased filenames encode each path segment, preserving reserved filename
characters such as `#`, `?` and `)`. The tests read the resulting files as well
as checking the link destinations. Raw queries and fragments remain separate
from escaped filename characters; quoted/list definition destinations are
rebased once using their recorded spans.

Explicit HTML `id` targets, legacy anchor names and local fragment links receive
the entry's prefix. Checks include quoted/unquoted attributes, multiline tags,
incoming Markdown links and inline/fenced HTML examples that remain literal.
All attributes are tokenized respecting their quoted values, so text resembling
an ID inside a title or data attribute is preserved.

The [independent GitHub GFM rendering check](github-render-verification-v2.json)
uses three render requests on synthetic input/output. All eight named links
preserve resolved resources and titles, including relative encoded filenames
with queries; literal text and both footnotes remain. Explicit target IDs were
observed in the rendered HTML inventory. Fixtures were removed. This is API
rendering evidence, not browser clicking, website deployment or visual acceptance.

The original Home-reference assertion required an unchanged label; it now
checks the destination and matching usage independently of that label. The
initial namespace run passed 29/30 before this assertion adjustment. Earlier
results remain preserved; no failure was hidden or converted to an acceptance
claim. No real workspace migration, dependency installation, website build,
browser acceptance, CI configuration or cloud change ran. The exercised syntax
is not certification of a full Markdown parser or concurrent writers.

The larger correction remains one navigation-preservation change: three remote
findings plus concrete peer regressions share the same definition/usage and
literal-span handling. Splitting that implementation would leave intermediate
consolidation paths with known broken links. Source/tests and audit evidence
are committed separately; no dependency or runtime framework was introduced.

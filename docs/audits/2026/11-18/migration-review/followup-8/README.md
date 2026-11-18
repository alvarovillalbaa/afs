# Emphasis targets and retained evidence

The completed review of `05fdef18603a7b9d9c34a5d3545becfedd14091d` found
[emphasis delimiters retained in heading anchors](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4616496479)
and [automatic edits to retained source captures](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4616496502).
Both focused regressions [fail on that source](baseline.json).

Heading extraction now matches asterisk and underscore delimiter runs before
character-reference decoding. It accounts for Unicode punctuation/whitespace,
intraword underscores, nested and crossing runs, and the rule of three described
by [CommonMark](https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis).
Escaped punctuation and inline code retain their raw boundary context while
remaining literal. Unmatched and entity-produced underscores also remain literal.
A [peer baseline](peer-baseline.json) caught emphasis crossing a completed link
boundary in the first correction. Link display is now resolved in its own scope
and treated atomically by outer emphasis; HTML tags retain their punctuation
boundary without contributing display text. The [focused recheck](peer-review.json)
passes six link/HTML cases and confirms byte-identical retry without duplicates.

The inbound scan excludes retained registry and legacy intake trees under the
selected AFS target. Explicitly selected registry jobs still run; maintained
README and workspace-skill links still follow relocated targets. Root and docs
profile regressions preserve eleven captures and a nested invalid-UTF-8 capture
byte for byte. Preserved evidence may contain obsolete paths, which remain a
reported owner-review boundary rather than a reason to alter the original.

The [verification receipt](final-verification.json) records 53 passing focused
Node tests, six JavaScript syntax checks, clean whitespace and unchanged dirty
primary HEAD/status/diff/index fingerprints. The
[independent GitHub GFM check](github-render-verification.json) observes equal
display text for all 20 [input headings](source-heading-fixture.md) and a rendered
target for each incoming prefixed fragment. Its REST response omits original
automatic heading IDs; this check does not claim original-page anchor observation
or browser clicking.

No real workspace migration, parser certification, atomic filesystem transaction,
concurrent-writer isolation, dependency installation, app build, database or
production verification is claimed. Temporary synthetic fixtures were removed.

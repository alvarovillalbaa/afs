# HTML destinations and fenced examples

The completed review of `94c20d71290bb28d52037ae1b04366d4d0bd897e` found
[relative HTML links](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615328325)
left at retired paths and [heading anchors inserted into longer fenced examples](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615328338).
Both regression cases [failed before correction](baseline.json).

Actual relative `href`, `src`, `poster` and `xlink:href` attributes now use the
same relocation and entry-anchor mappings as Markdown destinations. The
quote-aware tokenizer preserves unrelated attributes. Rewritten values are
quoted, basic/numeric HTML character references are decoded once and escaped
for serialization, and HTML paths do not apply Markdown backslash escapes.
Unsupported named entities or invalid numeric characters stop with source
retained for content-owner review. External destinations remain intact.

Heading anchors track the opening fence character and length. Only a matching
delimiter of sufficient length followed by whitespace closes it. This follows
the [CommonMark fence rules](https://spec.commonmark.org/0.31.2/#fenced-code-blocks).
Attribute handling follows the [HTML syntax](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2)
and a bounded subset of [character references](https://html.spec.whatwg.org/multipage/named-characters.html).

Bounded peer review reproduced comment-body mutation and bare-attribute query
truncation. Their [negative baseline](peer-baseline.json) is retained. Complete
comments, including blank lines, are protected during link rebasing. A further
[negative boundary fixture](block-boundary-baseline.json) reproduced unrelated
backticks across separate blocks; block classification now resets inline
endpoints, while comment endpoints alone may cross those boundaries.

The [final verification](final-verification.json) records 43 passing focused
Node tests, five JavaScript syntax checks, `git diff --check` and unchanged
dirty-primary HEAD/status/diff/index fingerprints. An intermediate 41-test run
passed 40 tests; its one failure was an old assertion requiring a fragment-only
HTML href. The assertion now checks the equivalent root-catalog href and exact
matching target. It was not removed. Peer cases extended the suite to 43.

The [current independent GitHub GFM rendering check](github-render-verification-v3.json)
observes both rewritten targets, complete quoted query contents and equal
rendered code samples, including longer fences. Comment bytes remain equal and
are not rendered as links. Earlier renderer receipts retain the preceding
implementation states. Fixtures are synthetic and removed afterward.

Current [peer rechecks](peer-review.json) are bounded AI review, not human
approval or full Markdown/HTML parser certification. No dependency, website
build, browser clicking, real downstream migration, concurrent-writer isolation
or production acceptance is claimed.

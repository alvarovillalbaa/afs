# URL character references

The migration decoder uses the complete named-character lookup from the
[WHATWG HTML Standard](https://html.spec.whatwg.org/entities.json), captured on
2026-11-18. Attribution: WHATWG (Apple, Google, Mozilla, Microsoft). The upstream
[license](https://github.com/whatwg/html/blob/main/LICENSE) covers incorporated
source material under BSD-3-Clause; the [notice, conditions and disclaimer](html-named-character-references.LICENSE.txt)
are retained beside the data.

[The local snapshot](html-named-character-references.json) keeps all 2,231
upstream keys and character strings, including 2,125 semicolon-terminated names.
The transformation removes redundant code-point arrays, sorts the keys and
serializes ASCII JSON. No character value is edited. The downloaded source
SHA-256 is `d741d877ac77c4194c4ad526b5b4a19aef8dfe411ab840a466891cdbb9f362e6`;
the local snapshot SHA-256 is
`ef03c4476114ddb0ac18b4fc626e881e828022b1e4b94b3fb0717810663f83dc`.
All entries also matched Python's independent standard-library HTML5 table.

Markdown decoding follows [CommonMark character-reference and escape rules](https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references).
For URL cleanup, entity decoding precedes punctuation unescaping, matching
[cmark-gfm's implementation](https://github.com/github/cmark-gfm/blob/master/src/inlines.c).
This order applies to destinations, not ordinary prose escapes.
HTML attributes use [HTML character-reference rules](https://html.spec.whatwg.org/multipage/parsing.html#character-reference-state),
including legacy names, ambiguous-ampersand handling and numeric replacements.
Decoding is one pass, so `&amp;copy;` becomes literal `&copy;`, not a copyright
character. URL classification then applies [ASCII-whitespace preprocessing](https://url.spec.whatwg.org/#concept-basic-url-parser).
Markdown output escapes ampersands and encodes delimiter/whitespace characters
so serialization does not interpret the decoded destination a second time.

These are bundled reference data and repository code. Migration installs no
package and makes no runtime network request. The surrounding Markdown/HTML
traversal still has the [documented migration proof limits](maintenance-and-validation.md).

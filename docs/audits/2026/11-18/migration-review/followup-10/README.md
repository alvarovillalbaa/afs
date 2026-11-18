# Linked-image destination preservation

The completed review of `ac3e0b87100b76f07fc623326838d90af02537c9` found
[nested image destinations skipped inside link labels](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4616967977).
The [baseline](baseline.json) reproduces an image retaining `../assets/logo.svg`
after its registry moves to root `REFERENCES.md`, changing resource identity.

The nested inline-image branch now uses the same destination rebasing as
top-level images. It retains alternative text, outer-link destination and titles.
The regression covers consolidated registries, moved directories, incoming
images mapped to moved SVGs, angle/balanced-parenthesis destinations and code.

The [verification receipt](final-verification.json) records 55 focused Node tests,
six JavaScript syntax checks, clean whitespace and unchanged dirty-primary
HEAD/status/diff/index fingerprints. The [independent peer review](peer-review.json)
checks six inline/reference-outer-link cases, conflict-resolved SVG mapping,
entities/query, literal alternative-text code and byte-identical retry.

The [GitHub GFM rendering check](github-render-verification.json) observes two
actual images before and after consolidation. Resolving their emitted image
URLs against their respective document paths identifies the same resources;
outer links and adjacent code remain intact. This uses synthetic fixtures and
does not claim resource downloads, browser clicking or visual acceptance.

Fixtures were removed. No real workspace migration, install, build, database,
full parser certification or production verification is claimed.

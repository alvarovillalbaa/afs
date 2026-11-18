# Unique heading suffix allocation

The completed review of `e3835206158a5ffadc8cff04741b229e88f8e56d` found
[collisions between duplicate-heading suffixes and literal numbered headings](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4616751556).
The [six-heading regression](source-heading-fixture.md) fails on that revision:
six headings receive only four distinct heading IDs, leaving incoming fragments
without a unique destination. The [failed baseline](baseline.json) is retained.

Each entry now tracks all allocated heading IDs. A proposed suffix advances
until the full ID is unused, including IDs previously assigned to other base
slugs. The matrix exercises `A`, repeated `A`, `A-1`, another `A`, another `A-1`
and `A-1-1`; incoming fragments and all explicit IDs must resolve uniquely.

The [verification receipt](final-verification.json) records 54 passing focused
Node tests, six JavaScript syntax checks, clean whitespace and unchanged dirty
primary HEAD/status/diff/index fingerprints. No real downstream workspace was
migrated and no install, app build, database or production check was run.

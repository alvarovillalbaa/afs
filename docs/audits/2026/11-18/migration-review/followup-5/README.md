# Transformation preflight and entry boundaries

The completed review of `21beb51cc55e87dcedd1c6c4aa68cf9a23dd82a2` found
[late transformation errors after earlier source retirement](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615577660),
[unmapped directory roots](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615577669)
and [EOF-terminated fences swallowing later entries](https://github.com/alvarovillalbaa/afs/pull/1#discussion_r4615577682).
All three [failed before correction](baseline.json).

The migrator now renders and validates every planned consolidation, directory
Markdown update and inbound rewrite before appending/moving/retiring source
content. Virtual destination text includes preceding planned sections, so
partial/changed retry markers are checked before earlier sources disappear.
The apply phase consumes prepared text, checks that destinations still match
their expected content, verifies link writeback and retires text originals last.

Fully admitted directory roots map to their destination roots alongside their
children; blocked roots remain at their source. Trailing slashes are retained.
Peer review found that empty relative paths inside the destination directory
must become `.` rather than its README filename. That case
[failed before the fallback correction](peer-baseline.json), and internal
`./`/`.` links and external directory links now retain their meaning.

An outstanding fence is explicitly closed at a consolidated entry's EOF
boundary. The original fenced payload remains intact, and the next entry's
heading, target and links remain outside code. This preserves the original
document boundary described in [CommonMark](https://spec.commonmark.org/0.31.2/#fenced-code-blocks).

The [final verification](final-verification.json) records all 46 focused Node
tests, five JavaScript syntax checks and `git diff --check`, with unchanged
dirty-primary HEAD/status/diff/index fingerprints. Bounded
[peer rechecks](peer-review.json) verify failure/retry preservation, directory
navigation, earlier HTML/URI/literal cases and entry isolation.
The [current GitHub GFM rendering check](github-render-verification-v2.json)
confirms equal EOF-fence code, a visible later-entry link/heading target, and
correct external/internal directory hrefs using five synthetic requests.
Fixtures were removed; the earlier renderer receipt remains historical.

This preflights transformation errors, not an atomic filesystem transaction.
I/O failures and concurrent writers still require owner review. No real
downstream migration, full Markdown/HTML parser certification, dependency,
website build, browser clicking or production verification is claimed.

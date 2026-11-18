# Follow-up migration review

The completed review of `1bcf8d95895d926cc783af1b42ff058816c7a8d1` found
three further cases. The [finding map](findings.json) binds each comment and
thread to its behavioral regression test.

All three new tests [failed against that source](baseline.json) before the
correction. The [corrected run](verification.json) passes all 27 focused tests,
all five JavaScript syntax checks and `git diff --check`. No new synthetic
fixture residue remained; the dirty primary's HEAD, status, binary diff and
Git index still match the preserved baseline.

- Reference definitions now use the same destination/anchor mapping as inline
  links. Tests cover titles, fragments, angle destinations, a destination on the
  following line, CRLF endings, links inside consolidated content and unchanged
  external URLs.
- A detected docs profile is recorded before its legacy detection documents are
  retired. A retained raw source remains blocked on both retries and subsequent
  automatic validation. Conflicting recorded placement is not overwritten.
- Mandatory root documents must be regular files. Validation rejects a directory
  at any of the four required document paths and preserves its contents.

Only synthetic fixtures were migrated. Existing workspace contents, dependencies,
builds, browser sessions, CI configuration and cloud destinations were not
changed. Remote publication, review completion and merging remain separate
gates. These checks do not certify a full Markdown parser or concurrent writes.

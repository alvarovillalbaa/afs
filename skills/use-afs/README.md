# use-afs

`use-afs` packages the Agentic FileSystem Standard as a repo-scoped agent skill.
It includes:

- AFS structure and placement rules.
- Scaffold, validate, and migrate scripts.
- Root Markdown templates.
- Agent usage templates for Notion Agents, Claude Code, Codex, Cursor,
  OpenClaw, and Hermes Agent.
- Best-effort bridge templates for Gbrain and QMD.
- Hook examples for running validation from agent workflows.

## Commands

```bash
npm run afs:create
npm run afs:create -- https://example.com/afs-standard
npm run afs:create -- --mode standalone --github
npm run afs:create -- ../agents-fs --compat gbrain,qmd
npm run afs:create -- --mode docs
npm run afs:validate -- .
npm run afs:migrate -- .
```

Auto-install rules:

- Empty folder: install the full AFS shell at root.
- Application repository: install AFS inside `docs/` so application code stays
  separate.
- Existing AFS-like folder: update root without overwriting files.
- Busy non-application folder: create `agents-fs/`.

Standalone personal and company AFS workspaces should normally live in a GitHub
repo named `agents-fs` unless the user explicitly says not to use GitHub.

The scripts are dependency-free Node.js programs so they can also be wrapped by
`npx` if this package is published later.

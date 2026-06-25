# Agent Usage

AFS should work across harnesses by keeping durable context in plain files.

## URL or GitHub Installation Prompt

If a user tells an agent to implement the AFS standard from a URL or GitHub
repository, the agent should:

1. Inspect the current folder.
2. Record the URL in `sources/afs-standard-source.md`.
3. Choose the install profile automatically.
4. Prefer a standalone GitHub repo named `agents-fs` for personal or company
   brains.
5. Use `docs/` when the current folder is an application code repository.
6. Validate with `npm run afs:validate -- .` after installation.

## Notion Agents

- Paste `templates/agent/notion-agent-instructions.md` into the Custom Agent
  instructions.
- Mirror root files as Notion pages when working primarily in Notion.
- Export or sync durable decisions into the AFS repository.
- Use Notion activity logs to inspect agent actions, but keep canonical
  long-lived context in AFS.

## Claude Code

- Keep `CLAUDE.md` short and import `AGENTS.md`.
- Install `skills/use-afs/` in the repository.
- Use `hooks/claude-settings.example.json` as the starting point for validation
  hooks when the project wants automatic checks around file writes.
- Store persistent rules in AFS root files, not only Claude-specific settings.

## Codex

- Use root and nested `AGENTS.md` files for repo instructions.
- Keep this skill under `skills/use-afs/`.
- Use `hooks/codex-hooks.example.json` as an adapter example for Codex-compatible
  hook runners.
- Run `npm run afs:validate -- .` before finalizing structural changes.

## Cursor

- Use `AGENTS.md` for shared agent policy.
- Copy `templates/agent/cursor-rule.mdc` to `.cursor/rules/use-afs.mdc`.
- Keep Cursor-specific rules focused on editor behavior while durable context
  stays in AFS.

## OpenClaw

- Use `templates/agent/openclaw-skill.md` as a bridge skill.
- Point OpenClaw at root files first, then folders.
- Treat OpenClaw compatibility as file-based adapter guidance unless native AFS
  support is published.

## Hermes Agent

- Use the generic AFS contract:
  - read root intent first;
  - write trace history to memory folders;
  - keep external material in `sources/`;
  - promote stable truth into `knowledge/`, `cookbook/`, `runbooks/`, or root
    files.
- Attach `AGENTS.md` and `BRAIN.md` templates until a Hermes-native adapter is
  available.

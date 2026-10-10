# AFS

AFS is the Agentic FileSystem Standard: portable instructions, unique knowledge,
work history, and source provenance shared across agent harnesses.

The [standard](skills/use-afs/references/afs-standard.md) defines the current
contract. Root instructions stay at the repository root; an application's AFS
folders live in `docs/`.

- Memory: logs, domain facts and lessons, fixes, and living decisions.
- Operational: audits, plans, specs, generated libraries, objects, and results.
- Source of truth: cookbooks, unique knowledge, runbooks, and continuous research units.
- References: one `REFERENCES.md`; source provenance: one `SOURCES.md`.
- Raw material: the correct personal or Clous Google Drive.
- Goals: Notion, guided by `ROADMAP.md`.
- Templates: beside the content they generate.

`AGENTS.md` owns AFS management. Company/product/customer vision belongs in
the matching root file. Friction goes into logs; regression prevention into fixes.

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

The creator selects root, application `docs/`, or standalone `agents-fs/`
placement and preserves existing files. Migration preserves source content and
reports material requiring verified Drive export or a content-specific owner.

## Website

The website's catalog is maintained in `lib/afs-content.ts`.
Use `npm run dev`, `npm run lint`, and `npm run build` when explicitly
requested. Structural script checks use Node without application dependencies.

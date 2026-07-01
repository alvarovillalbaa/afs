import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Brain,
  Building2,
  ClipboardList,
  Compass,
  FileText,
  FolderGit2,
  HeartPulse,
  History,
  KeyRound,
  Layers3,
  MessageSquareText,
  Network,
  NotebookTabs,
  PlaySquare,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Users,
  Wrench,
} from "lucide-react"

export type AfsPath = {
  path: string
  label: string
  description: string
}

export type AfsPathGroup = {
  id: string
  title: string
  summary: string
  paths: AfsPath[]
}

export type AfsRootFile = {
  file: string
  label: string
  description: string
  icon: LucideIcon
}

export type AfsInfoCard = {
  title: string
  description: string
  icon: LucideIcon
}

export type AfsInstallOption = {
  title: string
  command: string
  description: string
  icon: LucideIcon
}

export type AfsInstallProfile = {
  title: string
  placement: string
  description: string
  icon: LucideIcon
}

export type AfsAgentUsage = {
  agent: string
  usage: string
  setup: string
  files: string[]
  icon: LucideIcon
}

export type AfsCompatibilityTarget = {
  name: string
  status: string
  description: string
  files: string[]
  icon: LucideIcon
}

export const afsPrinciples: AfsInfoCard[] = [
  {
    title: "Filesystem first",
    description:
      "AFS stays useful through normal files, folders, Markdown, grep, pull requests, and backups.",
    icon: Archive,
  },
  {
    title: "Portable across harnesses",
    description:
      "Codex, Claude Code, Cursor, Notion Agents, OpenClaw, Hermes, and local tools can share the same durable context.",
    icon: Network,
  },
  {
    title: "Trace history is separate from truth",
    description:
      "Timestamped logs, lessons, fixes, plans, results, and reflections preserve work-in-time evidence; live specs, runbooks, and knowledge hold current truth.",
    icon: History,
  },
  {
    title: "Human intent stays at the root",
    description:
      "Root files such as AGENTS.md, USER.md, VISION.md, LOOPS.md, TASTE.md, and GAPS.md keep direction and missing understanding readable before agents act.",
    icon: Brain,
  },
]

export const problemPoints: AfsInfoCard[] = [
  {
    title: "Agent memory is fragmented",
    description:
      "Each harness stores instructions, traces, and context in its own format, so useful knowledge is trapped in one tool.",
    icon: Network,
  },
  {
    title: "Context is hard to move",
    description:
      "Teams need a plain, portable structure that lets agents share traces, context, sources, and decisions without a platform migration.",
    icon: FolderGit2,
  },
  {
    title: "Knowledge needs provenance",
    description:
      "External docs, links, copied references, source snapshots, and generated summaries need an obvious home with source history.",
    icon: Search,
  },
]

export const afsPathGroups: AfsPathGroup[] = [
  {
    id: "memory",
    title: "Memory",
    summary:
      "Durable history, facts, lessons, fixes, steering traces, and reflections that help agents improve across sessions.",
    paths: [
      {
        path: "/logs/",
        label: "Logs",
        description:
          "Brief change logs, two lines max, appended to the latest dated file under YYYY/MM-DD/ such as logs/2026/06-29/changes.md.",
      },
      {
        path: "/lessons/<domain>/",
        label: "Lessons",
        description:
          "Lessons learned from experience, organized by domain and timestamp folders such as YYYY/MM-DD/.",
      },
      {
        path: "/facts/",
        label: "Facts",
        description:
          "Live factual documentation about the user, companies, items, episodes, and triples; organize by type first, then domain.",
      },
      {
        path: "/facts/items/<domain>/",
        label: "Fact items",
        description:
          "Live atomic fact records and item documentation, grouped by domain. Do not place these under timestamped folders.",
      },
      {
        path: "/facts/episodes/<domain>/",
        label: "Episodes",
        description:
          "Live episode records derived from fact items or user/company history, grouped by domain. Do not place these under timestamped folders.",
      },
      {
        path: "/facts/triples/<domain>/",
        label: "Triples",
        description:
          "Live subject-predicate-object triples derived from fact items and episodes, grouped by domain. Do not place these under timestamped folders.",
      },
      {
        path: "/fixes/",
        label: "Fixes",
        description:
          "Error solutions from issues that were actually fixed, organized in timestamp folders such as YYYY/MM-DD/.",
      },
      {
        path: "/steers/",
        label: "Steers",
        description:
          "Traces of agent work that a human or secondary model redirected, including what the agent got wrong or missed, organized in timestamp folders.",
      },
      {
        path: "/models/decisions/",
        label: "Decisions",
        description:
          "Live brief records of decisions made so reasoning remains inspectable.",
      },
      {
        path: "/models/problems/",
        label: "Problems",
        description:
          "Live brief records of problems encountered and their current status.",
      },
      {
        path: "/models/goals/",
        label: "Goals",
        description:
          "Live brief records of goals set, active goals, and goal outcomes.",
      },
      {
        path: "/reflections/",
        label: "Reflections",
        description:
          "Detailed platform, project, workflow, or agent-behavior reflections, organized in timestamp folders such as YYYY/MM-DD/.",
      },
    ],
  },
  {
    id: "operational",
    title: "Operational",
    summary:
      "Work products, raw material, plans, specs, generated libraries, and domain-specific operating surfaces.",
    paths: [
      {
        path: "/audits/",
        label: "Audits",
        description:
          "Comprehensive reports and analytical audits used for audit-driven development, organized in timestamp folders such as YYYY/MM-DD/.",
      },
      {
        path: "/raw/",
        label: "Raw",
        description:
          "Raw data waiting to be ingested, processed, defined in knowledge/ or another canonical destination, and then removed or marked as done.",
      },
      {
        path: "<domain>/<folder>/",
        label: "Domain folders",
        description:
          "Additional domain-specific paths for areas such as health/, investing/, sales/, or operations/ when the domain genuinely needs its own surface.",
      },
      {
        path: "/plans/",
        label: "Plans",
        description:
          "Implementation plans and plan-driven-development artifacts, organized in timestamp folders such as YYYY/MM-DD/.",
      },
      {
        path: "/specs/",
        label: "Specs",
        description:
          "Living desired-state documentation describing how something should be. These are primarily human-defined and not timestamped.",
      },
      {
        path: "/sources/",
        label: "Sources",
        description:
          "URL-based sources to monitor, extract, compile, and organize into knowledge additions.",
      },
      {
        path: "/lib/",
        label: "Library",
        description:
          "A library for generated content, drafts, registries, indexes, and other reusable support artifacts.",
      },
      {
        path: "/objects/<type>/",
        label: "Objects",
        description:
          "Structured object records such as clients, employees, vendors, accounts, projects, or product surfaces.",
      },
      {
        path: "/templates/",
        label: "Templates",
        description:
          "Reusable templates such as AI prompts, emails, scripts, and other repeatable starting points.",
      },
      {
        path: "/results/",
        label: "Results",
        description:
          "Stored results from work that was run and needs to be preserved, organized in timestamp folders such as YYYY/MM-DD/.",
      },
    ],
  },
  {
    id: "truth",
    title: "Source of truth",
    summary:
      "Living documentation that represents the current canonical understanding of the codebase, company, workflows, and sources.",
    paths: [
      {
        path: "/references/",
        label: "References",
        description:
          "Code, URL, API, schema, and technical references that need stable lookup as live documentation.",
      },
      {
        path: "/cookbooks/",
        label: "Cookbooks",
        description:
          "Technical guides for how something is actually done in the codebase or operating environment.",
      },
      {
        path: "/knowledge/",
        label: "Knowledge",
        description:
          "Timeless maintained knowledge about the codebase, business, or how to do something. It can be defined by humans or compiled from raw/.",
      },
      {
        path: "/runbooks/",
        label: "Runbooks",
        description:
          "Operational procedures for how recurring work should be done after it has been performed in a known way.",
      },
      {
        path: "/research/",
        label: "Research",
        description:
          "Continuous research related to software engineering, business areas, markets, or other ongoing questions.",
      },
    ],
  },
]

export const rootFiles: AfsRootFile[] = [
  {
    file: "BRAIN.md",
    label: "Brain",
    description: "Decides how the AFS should be managed.",
    icon: Brain,
  },
  {
    file: "VISION.md",
    label: "Vision",
    description:
      "Defines the north star, current direction, non-goals, strategic constraints, and what agents should protect over time.",
    icon: Compass,
  },
  {
    file: "LOOPS.md",
    label: "Loops",
    description:
      "Defines recurring agent loops, triggers, cadence, review gates, stop conditions, and improvement cycles.",
    icon: Radar,
  },
  {
    file: "TASTE.md",
    label: "Taste",
    description:
      "Captures high-quality and personalized judgment: what good looks like, preferred examples, anti-patterns, and subjective standards.",
    icon: Sparkles,
  },
  {
    file: "GAPS.md",
    label: "Gaps",
    description:
      "Tracks gaps in human or agent understanding so unresolved questions stay visible until agents can resolve them into durable knowledge.",
    icon: Search,
  },
  {
    file: "MEMORY.md",
    label: "Memory rules",
    description: "Defines how memory should be captured, promoted, and maintained.",
    icon: History,
  },
  {
    file: "PLAYBOOK.md",
    label: "Playbook",
    description: "Defines decision frameworks and repeatable operating patterns.",
    icon: PlaySquare,
  },
  {
    file: "AGENTS.md",
    label: "Agent rules",
    description:
      "Defines general operating rules for AI agents working in the codebase, including conventions, workflows, architecture boundaries, testing expectations, and human collaboration.",
    icon: Users,
  },
  {
    file: "PLAN.md",
    label: "Planning",
    description:
      "Defines how planning should be done, including structure, milestones, execution order, priority rules, progress tracking, and plan updates.",
    icon: ClipboardList,
  },
  {
    file: "SPEC.md",
    label: "Specifications",
    description:
      "Defines how specs should be written, including required sections, acceptance criteria, edge cases, constraints, implementation notes, and validation rules.",
    icon: FileText,
  },
  {
    file: "SOUL.md",
    label: "Agent style",
    description:
      "Gives personality, attitude, and behavioral style to AI agents, including tone, decision posture, collaboration principles, and risk tolerance.",
    icon: Sparkles,
  },
  {
    file: "USER.md",
    label: "User context",
    description:
      "Stores general context about the user, including preferences, background, goals, working constraints, communication expectations, and long-term priorities.",
    icon: KeyRound,
  },
  {
    file: "DESIGN.md",
    label: "Design system",
    description:
      "Defines frontend design principles, component rules, layout patterns, typography, color usage, spacing, interaction states, and UX standards.",
    icon: Layers3,
  },
  {
    file: "PRODUCT.md",
    label: "Product",
    description:
      "Defines what the product is, who it serves, core value proposition, use cases, principles, feature boundaries, and strategic direction.",
    icon: Compass,
  },
  {
    file: "COMPANY.md",
    label: "Company",
    description:
      "Defines company-level context, including mission, positioning, operating principles, team structure, culture, business model, and priorities.",
    icon: Building2,
  },
  {
    file: "VALUES.md",
    label: "Values",
    description:
      "Defines the values on which the company, user, product, and codebase should be based.",
    icon: ShieldCheck,
  },
  {
    file: "ICP.md",
    label: "Ideal customer",
    description:
      "Defines target segments, buyer personas, pains, desired outcomes, buying triggers, objections, qualification criteria, and non-fit customers.",
    icon: Target,
  },
  {
    file: "VOICE.md",
    label: "Voice",
    description:
      "Defines communication style, tone, vocabulary, messaging patterns, banned phrases, examples, and how to sound consistent across channels.",
    icon: MessageSquareText,
  },
  {
    file: "FRICTION.md",
    label: "Friction",
    description:
      "Documents user, customer, developer, or operational friction points, repeated complaints, blockers, inefficiencies, adoption barriers, and pain to reduce.",
    icon: Wrench,
  },
  {
    file: "PREDICTION.md",
    label: "Prediction",
    description:
      "Captures expected future risks, opportunities, user behaviors, market shifts, technical bottlenecks, and product bets.",
    icon: Radar,
  },
  {
    file: "REGRESSIONS.md",
    label: "Regressions",
    description:
      "Tracks known failures, recurring bugs, fragile assumptions, broken flows, previous fixes, test gaps, and regression traps.",
    icon: ShieldAlert,
  },
  {
    file: "HEARTBEAT.md",
    label: "Heartbeat",
    description:
      "Defines recurring operational status, active priorities, blockers, recent progress, next actions, health checks, and reporting cadence.",
    icon: HeartPulse,
  },
]

export const installationOptions: AfsInstallOption[] = [
  {
    title: "Auto-install in the current workspace",
    command: "npm run afs:create",
    description:
      "Inspect the current folder and choose root, docs/, or agents-fs/ placement automatically.",
    icon: Terminal,
  },
  {
    title: "Install from a standard URL",
    command: "npm run afs:create -- https://example.com/afs-standard",
    description:
      "Record the provided standard or GitHub URL in sources/ and still choose the safest install placement automatically.",
    icon: Network,
  },
  {
    title: "Create a standalone agents-fs repo",
    command: "npm run afs:create -- --mode standalone --github",
    description:
      "Create a personal or company AFS repository named agents-fs and push it to GitHub when gh is authenticated.",
    icon: FolderGit2,
  },
  {
    title: "Install inside an application repo",
    command: "npm run afs:create -- --mode docs",
    description:
      "Create the full AFS shell inside docs/ so the application source tree stays separate from agent context.",
    icon: FileText,
  },
  {
    title: "Validate an AFS workspace",
    command: "npm run afs:validate -- .",
    description:
      "Check for removed paths, missing recommended shell files, legacy context/ usage, and stale layout names.",
    icon: ShieldCheck,
  },
  {
    title: "Migrate legacy AFS paths",
    command: "npm run afs:migrate -- .",
    description:
      "Move legacy official-documentation/, items/, cookbook/, and domain-first facts into sources/, facts/items/general/, cookbooks/, and the type-first facts layout without overwriting existing material.",
    icon: Wrench,
  },
]

export const installationProfiles: AfsInstallProfile[] = [
  {
    title: "Empty or sparse folder",
    placement: "root",
    description:
      "Create the full shell directly at the folder root, including root Markdown files, knowledge/INDEX.md, raw tracking files, sources/INDEX.md, facts/, models/, and templates/.",
    icon: Archive,
  },
  {
    title: "Standalone brain",
    placement: "agents-fs",
    description:
      "Use a GitHub repository named agents-fs by default for personal, company, or cross-project AFS workspaces.",
    icon: FolderGit2,
  },
  {
    title: "Application repository",
    placement: "docs/",
    description:
      "Install AFS under docs/ so agent memory, source provenance, and knowledge stay separated from app code.",
    icon: FileText,
  },
  {
    title: "Busy non-application folder",
    placement: "agents-fs/",
    description:
      "Create a nested agents-fs/ folder when the current directory is already populated but is not an app repo or existing AFS root.",
    icon: Layers3,
  },
  {
    title: "Standard URL or GitHub URL",
    placement: "auto",
    description:
      "Agents should treat a request to implement the AFS URL as an install request and choose the safest placement automatically.",
    icon: Network,
  },
]

export const githubRepoExamples: AfsInfoCard[] = [
  {
    title: "alvarovillalbaa/agents-fs",
    description:
      "Private personal AFS repo using BRAIN.md, knowledge/INDEX.md, raw processing files, sources/, and canonical knowledge pages.",
    icon: Brain,
  },
  {
    title: "clous-ai/agents-fs",
    description:
      "Private company AFS repo using BRAIN.md as the root marker, raw/ as intake, and knowledge/INDEX.md as the maintained navigation surface.",
    icon: Building2,
  },
]

export const agentUsageGuides: AfsAgentUsage[] = [
  {
    agent: "Notion Agents",
    usage:
      "Paste the Notion template into Custom Agent instructions and point it at the pages or databases that mirror AFS root files and folders.",
    setup:
      "Keep durable outputs in Notion pages named after AFS files, then periodically export or sync them into the repository.",
    files: ["templates/agent/notion-agent-instructions.md", "VISION.md", "LOOPS.md", "GAPS.md"],
    icon: ClipboardList,
  },
  {
    agent: "Claude Code",
    usage:
      "Use CLAUDE.md to import AGENTS.md, install the use-afs skill, and add the hook example when you want validation around file writes.",
    setup:
      "Keep scoped Claude rules thin and let the root AFS files define persistent policy.",
    files: ["CLAUDE.md", ".claude/settings.json", "skills/use-afs/"],
    icon: Brain,
  },
  {
    agent: "Codex",
    usage:
      "Use AGENTS.md plus the repo-scoped skills/use-afs skill so Codex can route context, sources, and validation consistently.",
    setup:
      "Add optional Codex hooks for validation before major write operations.",
    files: ["AGENTS.md", "skills/use-afs/", ".codex/hooks/"],
    icon: FolderGit2,
  },
  {
    agent: "Cursor",
    usage:
      "Use AGENTS.md for shared rules and the Cursor .mdc template for editor-local routing to AFS root files and folders.",
    setup:
      "Keep Cursor-specific UI or codebase rules scoped, while durable facts remain in AFS.",
    files: ["AGENTS.md", ".cursor/rules/use-afs.mdc"],
    icon: Compass,
  },
  {
    agent: "OpenClaw",
    usage:
      "Use the OpenClaw template as a bridge skill that points the agent to AFS root files, sources/, logs/, and validation scripts.",
    setup:
      "Treat the bridge as adapter guidance unless the OpenClaw project adds a native AFS integration.",
    files: ["templates/agent/openclaw-skill.md", "AGENTS.md", "BRAIN.md"],
    icon: Network,
  },
  {
    agent: "Hermes Agent",
    usage:
      "Use the generic AFS operating contract: read root intent first, write trace history into memory folders, and keep external material in sources/.",
    setup:
      "Attach the AGENTS.md and BRAIN.md templates to Hermes until a native adapter is available.",
    files: ["AGENTS.md", "BRAIN.md", "sources/"],
    icon: MessageSquareText,
  },
]

export const compatibilityTargets: AfsCompatibilityTarget[] = [
  {
    name: "Gbrain by Garry Tan",
    status: "Best-effort bridge",
    description:
      "AFS can expose GBRAIN.md and BRAIN.md as adapter surfaces so Gbrain-style knowledge can point back to portable files and sources.",
    files: ["GBRAIN.md", "BRAIN.md", "sources/"],
    icon: Brain,
  },
  {
    name: "QMD by Toby at Shopify",
    status: "Best-effort bridge",
    description:
      "AFS can expose QMD.md as a query and decision bridge that maps QMD-style notes back to specs, plans, knowledge, and source provenance.",
    files: ["QMD.md", "GAPS.md", "specs/", "plans/", "knowledge/"],
    icon: FileText,
  },
  {
    name: "Plain agent harnesses",
    status: "Native filesystem compatibility",
    description:
      "Any harness that can read files and write Markdown can use AFS without a proprietary database or hosted service.",
    files: ["AGENTS.md", "VISION.md", "GAPS.md", "sources/"],
    icon: Network,
  },
]

export const retrievalModes: AfsInfoCard[] = [
  {
    title: "Filesystem",
    description: "Normal folders and Markdown files keep the standard inspectable.",
    icon: Archive,
  },
  {
    title: "Keyword",
    description: "grep, ripgrep, and search indexes can retrieve exact language.",
    icon: Search,
  },
  {
    title: "Semantic",
    description:
      "Embeddings and retrieval tools can index AFS while the filesystem remains the source of truth.",
    icon: NotebookTabs,
  },
]

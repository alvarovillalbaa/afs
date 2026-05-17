import type { LucideIcon } from "lucide-react"
import {
  Archive,
  Brain,
  Building2,
  ClipboardList,
  Compass,
  Database,
  FileText,
  FolderGit2,
  HeartPulse,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
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

export type VafsFeature = {
  title: string
  description: string
  icon: LucideIcon
}

export const afsPrinciples = [
  {
    title: "Filesystem first",
    description:
      "AFS stays useful through normal files, folders, Markdown, grep, pull requests, and backups.",
  },
  {
    title: "Agent portable",
    description:
      "Any agentic system should be able to enter the same structure and understand where durable context belongs.",
  },
  {
    title: "History is separate from truth",
    description:
      "Logs, lessons, fixes, and plans preserve work-in-time evidence; specs, runbooks, and knowledge hold current truth.",
  },
  {
    title: "Human intent stays legible",
    description:
      "Files like SPEC.md, USER.md, COMPANY.md, VALUES.md, and SOUL.md make goals and judgment visible to agents.",
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
          "Brief logs, two lines max, appended to the latest date file for meaningful changes. In non-code platforms, this can store conversational, experience, action, or pattern history.",
      },
      {
        path: "/lessons/",
        label: "Lessons",
        description:
          "Lessons learned from experience, especially reusable lessons related to code and implementation work.",
      },
      {
        path: "/items/",
        label: "Items",
        description:
          "Durable facts about the user, company, customers, environments, priorities, or other reusable context.",
      },
      {
        path: "/fixes/",
        label: "Fixes",
        description:
          "Reusable error solutions and debugging resolutions from problems that were actually fixed.",
      },
      {
        path: "/steers/",
        label: "Steers",
        description:
          "Traces of work that an AI did but a human or secondary LLM redirected, including what the agent got wrong or did not fully satisfy.",
      },
      {
        path: "/models/",
        label: "Models",
        description:
          "Brief logs of decisions made, problems encountered, and goals set so reasoning stays inspectable over time.",
      },
      {
        path: "/reflections/",
        label: "Reflections",
        description:
          "Detailed reflections based on the platform, project, workflow, or recurring agent behavior.",
      },
    ],
  },
  {
    id: "operational",
    title: "Operational",
    summary:
      "Work products, raw material, plans, specs, sources, generated libraries, and domain-specific operating surfaces.",
    paths: [
      {
        path: "/audits/",
        label: "Audits",
        description:
          "Comprehensive reports and analytical audits, usually organized in timestamp folders such as YYYY-MM-DD/.",
      },
      {
        path: "/raw/",
        label: "Raw",
        description:
          "Raw data waiting to be ingested, defined, and promoted into knowledge/ or another canonical destination, then removed from raw/.",
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
          "Implementation plans and plan-driven development artifacts describing how work should be executed.",
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
          "URL-based sources to monitor over time and mine for high-quality additions to the knowledge base.",
      },
      {
        path: "/lib/",
        label: "Library",
        description:
          "Reusable generated content, drafts, registries, templates, and other support artifacts.",
      },
      {
        path: "/objects/<type>/",
        label: "Objects",
        description:
          "Structured object records such as clients, employees, vendors, accounts, or projects. Example: objects/clients/.",
      },
    ],
  },
  {
    id: "truth",
    title: "Source of truth",
    summary:
      "Living documentation that should represent the current canonical understanding of the codebase, company, and workflows.",
    paths: [
      {
        path: "/references/",
        label: "References",
        description:
          "Code, URL, API, schema, and factual references that need stable lookup.",
      },
      {
        path: "/cookbook/",
        label: "Cookbook",
        description:
          "Technical guides for how something is actually done in the codebase.",
      },
      {
        path: "/knowledge/",
        label: "Knowledge",
        description:
          "Timeless maintained knowledge about the codebase, business, or how to do something. It can be defined by humans or compiled by AI from raw/.",
      },
      {
        path: "/runbooks/",
        label: "Runbooks",
        description:
          "Operational procedures for how certain things ought to be done after they have been performed in a known way.",
      },
      {
        path: "/research/",
        label: "Research",
        description:
          "Continuous research related to software engineering, business areas, markets, or other ongoing questions.",
      },
      {
        path: "/official-documentation/",
        label: "Official documentation",
        description:
          "External provider documentation copied or preserved as official reference material; it is not iterated like internal docs.",
      },
      {
        path: "/context/",
        label: "Context",
        description:
          "Contextual documentation such as VALUES.md, USER.md, PREFERENCES.md, context/goals/, context/budget/, and context/roadmap/.",
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
      "Defines company-level context, including mission, vision, positioning, operating principles, team structure, culture, business model, and priorities.",
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

export const vafsFeatures: VafsFeature[] = [
  {
    title: "agents-fs repositories",
    description:
      "Standardized GitHub repositories named agents-fs will hold the official AFS paths and Markdown files.",
    icon: FolderGit2,
  },
  {
    title: "Vector-backed retrieval",
    description:
      "The filesystem will sync with an embeddings database while preserving regular grep and keyword retrieval.",
    icon: Database,
  },
  {
    title: "Access controls",
    description:
      "Individual and team permissions will be handled through Supabase-backed access control.",
    icon: LockKeyhole,
  },
  {
    title: "External integrations",
    description:
      "Connections to outside platforms will feed and retrieve context through the same standardized structure.",
    icon: Network,
  },
]

export const retrievalModes = [
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
    description: "Embeddings can retrieve intent and meaning once vAFS is available.",
    icon: NotebookTabs,
  },
]

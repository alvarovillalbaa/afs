import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BookOpen,
  FileText,
  FolderTree,
  Home,
  Layers3,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import {
  afsPathGroups,
  afsPrinciples,
  agentUsageGuides,
  compatibilityTargets,
  githubRepoExamples,
  installationOptions,
  installationProfiles,
  problemPoints,
  retrievalModes,
  rootFiles,
} from "@/lib/afs-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Start",
    items: [
      { href: "#overview", label: "Overview" },
      { href: "#problem", label: "Problem" },
      { href: "#principles", label: "Core principles" },
    ],
  },
  {
    label: "Paths",
    items: [
      { href: "#memory", label: "Memory" },
      { href: "#operational", label: "Operational" },
      { href: "#truth", label: "Source of truth" },
    ],
  },
  {
    label: "Files",
    items: [{ href: "#root-files", label: "Root MD files" }],
  },
  {
    label: "Setup",
    items: [
      { href: "#installation", label: "Installation" },
      { href: "#usage", label: "Agent usage" },
      { href: "#compatibility", label: "Compatibility" },
      { href: "#retrieval", label: "Retrieval" },
    ],
  },
]

const sectionIcons = [BookOpen, Route, ShieldCheck]

export default function DocsPage() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-zinc-200">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 font-heading">
            <span className="flex size-8 items-center justify-center rounded-[8px] bg-zinc-950 text-white">
              <FolderTree className="size-4" aria-hidden="true" />
            </span>
            <span>AFS Docs</span>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a href={item.href}>{item.label}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <p className="font-medium text-emerald-950">use-afs skill</p>
            <p className="mt-1 leading-5 text-emerald-900">
              The standard ships with templates, scripts, hooks, and references.
            </p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-[#fbfcfe]">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <span className="truncate font-heading text-sm font-medium text-zinc-600">
                Agentic FileSystem Standard
              </span>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <Home aria-hidden="true" />
                Home
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
          <DocHero />
          <ProblemSection />
          <PrinciplesSection />
          {afsPathGroups.map((group, index) => (
            <PathSection key={group.id} group={group} index={index} />
          ))}
          <RootFilesSection />
          <InstallationSection />
          <UsageSection />
          <CompatibilitySection />
          <RetrievalSection />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DocHero() {
  return (
    <section id="overview" className="scroll-mt-24">
      <Badge variant="outline" className="border-sky-300 bg-sky-50">
        Version 1 standard draft
      </Badge>
      <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
        Agentic FileSystem gives agents one reusable place to read and write
        durable context.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-700">
        AFS is a filesystem and Markdown standard for users, companies,
        codebases, and business areas. It keeps traces, source provenance,
        knowledge, and intent legible to humans and portable across agentic
        systems.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <QuickFact icon={FolderTree} label="Normal files" value="No database required" />
        <QuickFact icon={FileText} label="Markdown first" value="Readable by humans" />
        <QuickFact icon={Sparkles} label="Agent ready" value="Reusable context" />
      </div>
    </section>
  )
}

function QuickFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-4">
      <Icon className="mb-3 size-5 text-sky-700" aria-hidden="true" />
      <p className="text-sm font-medium text-zinc-950">{label}</p>
      <p className="mt-1 text-sm text-zinc-600">{value}</p>
    </div>
  )
}

function ProblemSection() {
  return (
    <section id="problem" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Problem"
        title="Agent harnesses do not share enough context by default."
        description="AFS exists because information between platforms is disconnected. Agents need a way to share traces, context, knowledge, source references, and working state in a format that is easy to move."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {problemPoints.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <Icon className="mb-4 size-5 text-sky-700" aria-hidden="true" />
              <h3 className="font-heading text-base font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PrinciplesSection() {
  return (
    <section id="principles" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Core principles"
        title="AFS stays portable before it becomes tooling."
        description="The standard should work in a plain Git repository, a personal notes folder, a company workspace, or any agent runtime that can read and write files."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {afsPrinciples.map((principle) => {
          const Icon = principle.icon

          return (
            <article
              key={principle.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <Icon
                className="mb-4 size-5 text-emerald-600"
                aria-hidden="true"
              />
              <h3 className="font-heading text-lg font-semibold">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {principle.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PathSection({
  group,
  index,
}: {
  group: (typeof afsPathGroups)[number]
  index: number
}) {
  const Icon = sectionIcons[index] ?? Layers3

  return (
    <section id={group.id} className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Path group"
        title={group.title}
        description={group.summary}
      />
      <div className="mt-6 rounded-[8px] border border-zinc-200 bg-white">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4">
          <Icon className="size-5 text-zinc-700" aria-hidden="true" />
          <p className="font-heading text-lg font-semibold">{group.title}</p>
          <Badge variant="secondary" className="ml-auto">
            {group.paths.length} paths
          </Badge>
        </div>
        <div className="grid divide-y divide-zinc-200">
          {group.paths.map((item) => (
            <article
              key={item.path}
              className="grid gap-3 px-5 py-4 md:grid-cols-[220px_1fr]"
            >
              <code className="w-fit rounded-[6px] bg-zinc-950 px-2 py-1 text-sm text-white">
                {item.path}
              </code>
              <div>
                <h3 className="font-heading text-base font-semibold">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function RootFilesSection() {
  return (
    <section id="root-files" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Root MD files"
        title="The files agents should check before making high-impact decisions."
        description="These files define the user, company, product, agent behavior, specs, plans, taste, loops, risk, and operational state. They should live at the root of an AFS-aware repository or workspace."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rootFiles.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.file}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-sky-50 text-sky-800">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-mono text-sm font-semibold text-zinc-950">
                    {item.file}
                  </h3>
                  <p className="mt-1 font-heading text-base font-semibold">
                    {item.label}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function InstallationSection() {
  return (
    <section id="installation" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Installation"
        title="The installer decides where AFS belongs."
        description="Auto-install chooses between an empty-root install, a standalone agents-fs repository, a docs/ install inside an application repo, or a nested agents-fs/ folder when the current directory is already busy."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {installationProfiles.map((profile) => {
          const Icon = profile.icon

          return (
            <article
              key={profile.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-sky-50 text-sky-800">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <Badge variant="secondary">{profile.placement}</Badge>
                  <h3 className="mt-3 font-heading text-lg font-semibold">
                    {profile.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                {profile.description}
              </p>
            </article>
          )
        })}
      </div>
      <div className="mt-6 rounded-[8px] border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="font-heading text-lg font-semibold text-emerald-950">
          GitHub-first standalone repos
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-900">
          Personal and company AFS workspaces should normally live in a private
          GitHub repo named agents-fs unless the user explicitly says not to use
          GitHub. The current private examples follow that pattern.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {githubRepoExamples.map((repo) => {
            const Icon = repo.icon

            return (
              <article key={repo.title} className="rounded-[8px] bg-white p-4">
                <Icon className="mb-3 size-5 text-zinc-800" aria-hidden="true" />
                <h4 className="font-mono text-sm font-semibold text-zinc-950">
                  {repo.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {repo.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {installationOptions.map((option) => {
          const Icon = option.icon

          return (
            <article
              key={option.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-800">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold">
                    {option.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {option.description}
                  </p>
                </div>
              </div>
              <code className="mt-4 block overflow-x-auto rounded-[6px] bg-zinc-950 px-3 py-2 text-sm text-white">
                {option.command}
              </code>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function UsageSection() {
  return (
    <section id="usage" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Usage"
        title="Use the same AFS source with different agent harnesses."
        description="Each harness may have its own instruction or hook format. AFS keeps the durable context and traces in the same portable files."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {agentUsageGuides.map((guide) => {
          const Icon = guide.icon

          return (
            <article
              key={guide.agent}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <Icon className="mb-4 size-5 text-zinc-800" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold">
                {guide.agent}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {guide.usage}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {guide.setup}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.files.map((file) => (
                  <code
                    key={file}
                    className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
                  >
                    {file}
                  </code>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CompatibilitySection() {
  return (
    <section id="compatibility" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Compatibility"
        title="Bridge files point external systems back to the same source."
        description="Gbrain and QMD compatibility is implemented as best-effort Markdown bridges. They are not represented as official integrations unless their maintainers publish native AFS support."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {compatibilityTargets.map((target) => {
          const Icon = target.icon

          return (
            <article
              key={target.name}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <Icon className="mb-4 size-5 text-zinc-800" aria-hidden="true" />
              <Badge variant="secondary">{target.status}</Badge>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                {target.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {target.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {target.files.map((file) => (
                  <code
                    key={file}
                    className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
                  >
                    {file}
                  </code>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function RetrievalSection() {
  return (
    <section id="retrieval" className="mt-14 scroll-mt-24">
      <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <Badge variant="outline" className="border-emerald-300 bg-white">
          Retrieval
        </Badge>
        <h2 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight">
          AFS remains useful through plain files while supporting richer search.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-950">
          Filesystem reads, keyword search, and semantic retrieval can all use
          the same folder standard. The filesystem remains the durable source of
          truth even when an agent adds indexes or embeddings.
        </p>
        <Separator className="my-7 bg-emerald-200" />
        <div className="grid gap-3 md:grid-cols-3">
          {retrievalModes.map((mode) => {
            const Icon = mode.icon

            return (
              <div key={mode.title} className="rounded-[8px] bg-white p-4">
                <Icon className="mb-3 size-5 text-zinc-800" aria-hidden="true" />
                <h3 className="font-heading text-sm font-semibold">
                  {mode.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {mode.description}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">
              Back to home
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium uppercase text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}

import Link from "next/link"
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
  retrievalModes,
  rootFiles,
  vafsFeatures,
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
    items: [
      { href: "#root-files", label: "Root MD files" },
      { href: "#vafs", label: "vAFS roadmap" },
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
            <p className="font-medium text-emerald-950">vAFS is future-facing</p>
            <p className="mt-1 leading-5 text-emerald-900">
              The open standard works today as files and folders.
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
          <PrinciplesSection />
          {afsPathGroups.map((group, index) => (
            <PathSection key={group.id} group={group} index={index} />
          ))}
          <RootFilesSection />
          <VafsSection />
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
      <h1 className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-5xl">
        Agentic FileSystem gives agents one reusable place to read and write
        durable context.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-700">
        AFS is a filesystem and Markdown standard for users, companies,
        codebases, and business areas. It keeps every important piece of
        information legible to humans and portable across agentic systems.
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
  icon: typeof FolderTree
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

function PrinciplesSection() {
  return (
    <section id="principles" className="mt-14 scroll-mt-24">
      <SectionHeading
        eyebrow="Core principles"
        title="AFS is designed to stay portable before it becomes a platform."
        description="The standard should work in a plain Git repository, a personal notes folder, a company workspace, or a future virtualized implementation."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {afsPrinciples.map((principle) => (
          <article
            key={principle.title}
            className="rounded-[8px] border border-zinc-200 bg-white p-5"
          >
            <ShieldCheck
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
        ))}
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
        description="These files define the user, company, product, agent behavior, specs, plans, risk, and operational state. They are intended to live at the root of an AFS-aware repository or workspace."
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

function VafsSection() {
  return (
    <section id="vafs" className="mt-14 scroll-mt-24">
      <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <Badge variant="outline" className="border-emerald-300 bg-white">
          Future official implementation
        </Badge>
        <h2 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight">
          vAFS will be the Virtual Agentic FileSystem for synced, permissioned,
          retrievable AFS workspaces.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-950">
          We are working on an official vAFS that uses standardized GitHub repos
          named agents-fs for all paths and Markdown files, synced with a vector
          embeddings database. Access controls for users and teams, plus
          integrations with external platforms, will be handled via Supabase.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {vafsFeatures.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="rounded-[8px] border border-emerald-200 bg-white p-5"
              >
                <Icon className="mb-4 size-5 text-emerald-700" />
                <h3 className="font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
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
      <p className="text-sm font-medium uppercase tracking-normal text-zinc-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}

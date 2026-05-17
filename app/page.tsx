import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FolderTree,
  GitBranch,
  LockKeyhole,
  Search,
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

const layerStyles = [
  "border-emerald-200 bg-emerald-50 text-emerald-950",
  "border-sky-200 bg-sky-50 text-sky-950",
  "border-zinc-200 bg-zinc-50 text-zinc-950",
]

export default function Home() {
  return (
    <main className="min-h-svh bg-[#f7f9fc] text-zinc-950">
      <SiteHeader />
      <Hero />
      <StandardLayers />
      <RootFiles />
      <VafsPreview />
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>AFS is an open filesystem standard for agentic context.</p>
          <Link
            href="/docs"
            className="font-medium text-zinc-950 underline-offset-4 hover:underline"
          >
            Read the documentation
          </Link>
        </div>
      </footer>
    </main>
  )
}

function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg">
          <span className="flex size-8 items-center justify-center rounded-[8px] bg-zinc-950 text-white">
            <FolderTree className="size-4" aria-hidden="true" />
          </span>
          AFS
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/docs">Docs</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/docs#root-files">
              Standard
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-16">
        <div className="space-y-7">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50">
            Portable context for agents
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.04] tracking-normal text-zinc-950 sm:text-6xl">
              AFS: Agentic FileSystem
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-700">
              A standard filesystem for every user and company to store reusable
              information across agentic systems, codebases, workflows, and
              business domains.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/docs">
                Open documentation
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs#vafs">View vAFS roadmap</Link>
            </Button>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
            <Stat value={afsPathGroups.length} label="layers" />
            <Stat
              value={afsPathGroups.reduce(
                (total, group) => total + group.paths.length,
                0
              )}
              label="paths"
            />
            <Stat value={rootFiles.length} label="root files" />
          </div>
        </div>
        <FileSystemMap />
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-zinc-50 px-4 py-3">
      <div className="font-heading text-2xl font-semibold">{value}</div>
      <div className="text-xs font-medium uppercase tracking-normal text-zinc-500">
        {label}
      </div>
    </div>
  )
}

function FileSystemMap() {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-[#111827] p-4 text-white shadow-xl shadow-zinc-200">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[8px] bg-white/10">
            <GitBranch className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">agents-fs</p>
            <p className="text-xs text-zinc-400">portable AFS repository</p>
          </div>
        </div>
        <Badge className="bg-emerald-400 text-emerald-950">standard</Badge>
      </div>
      <div className="grid gap-3">
        {afsPathGroups.map((group, index) => (
          <div
            key={group.id}
            className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-heading text-sm font-medium">{group.title}</p>
              <span
                className={`rounded-[6px] border px-2 py-1 text-xs ${layerStyles[index]}`}
              >
                {group.paths.length} paths
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {group.paths.slice(0, 6).map((item) => (
                <code
                  key={item.path}
                  className="truncate rounded-[6px] bg-black/30 px-2 py-1.5 text-xs text-zinc-200"
                >
                  {item.path}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {retrievalModes.map((mode) => {
          const Icon = mode.icon

          return (
            <div
              key={mode.title}
              className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <Icon className="size-4 text-sky-300" aria-hidden="true" />
              <span className="text-xs text-zinc-300">{mode.title}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StandardLayers() {
  return (
    <section className="border-b border-zinc-200 bg-[#f7f9fc]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionIntro
          eyebrow="The standard"
          title="A small set of paths that every agent can understand."
          description="AFS separates memory, operations, and current source-of-truth material so context can be added without turning a repo or company workspace into a junk drawer."
        />
        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {afsPathGroups.map((group, index) => (
            <article
              key={group.id}
              className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {group.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {group.summary}
                  </p>
                </div>
                <span
                  className={`rounded-[8px] border px-2 py-1 text-xs ${layerStyles[index]}`}
                >
                  {group.paths.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.paths.map((item) => (
                  <code
                    key={item.path}
                    className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
                  >
                    {item.path}
                  </code>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {afsPrinciples.map((principle) => (
            <article
              key={principle.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-5"
            >
              <CheckCircle2
                className="mb-4 size-5 text-emerald-600"
                aria-hidden="true"
              />
              <h3 className="font-heading text-base font-semibold">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function RootFiles() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionIntro
          eyebrow="Root Markdown files"
          title="Repository-level intent that agents can read first."
          description="The folder standard stores evidence and knowledge. The root Markdown files define operating rules, product direction, voice, values, risk, and current status."
        />
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rootFiles.slice(0, 9).map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.file}
                className="flex gap-3 rounded-[8px] border border-zinc-200 bg-[#fbfcfe] p-4"
              >
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-sky-700"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-mono text-sm font-semibold">
                    {item.file}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {item.label}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/docs#root-files">
              See all root files
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function VafsPreview() {
  return (
    <section className="bg-[#eef6f2]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <Badge variant="outline" className="border-emerald-300 bg-white">
              Future official layer
            </Badge>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              vAFS will make the standard virtual, synced, and permissioned.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-700">
              We are working on the official vAFS, a Virtual Agentic FileSystem
              built around standardized GitHub repositories named agents-fs,
              embeddings-backed retrieval, Supabase access controls, and
              integrations with external platforms.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Search aria-hidden="true" />
                grep-ready
              </Badge>
              <Badge variant="secondary">
                <Database aria-hidden="true" />
                vector-ready
              </Badge>
              <Badge variant="secondary">
                <LockKeyhole aria-hidden="true" />
                team access
              </Badge>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </div>
    </section>
  )
}

function SectionIntro({
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
      <div className="mb-4 flex items-center gap-3">
        <Separator className="w-10 bg-zinc-950" />
        <p className="text-sm font-medium uppercase tracking-normal text-zinc-500">
          {eyebrow}
        </p>
      </div>
      <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}

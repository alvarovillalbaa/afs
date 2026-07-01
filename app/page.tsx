import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FolderTree,
  GitBranch,
  Search,
} from "lucide-react"

import {
  afsPathGroups,
  afsPrinciples,
  compatibilityTargets,
  installationOptions,
  problemPoints,
  retrievalModes,
  rootFiles,
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
      <ProblemSection />
      <StandardLayers />
      <RootFiles />
      <InstallationPreview />
      <CompatibilityPreview />
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>AFS is an open filesystem standard for portable agent context.</p>
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
            <Link href="/docs#installation">
              Install
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
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.04] text-zinc-950 sm:text-6xl">
              AFS: Agentic FileSystem
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-700">
              A standard filesystem for storing reusable traces, context,
              sources, and knowledge across agent harnesses, codebases,
              workflows, and business domains.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/docs#installation">
                Install AFS
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs#usage">Agent usage</Link>
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
      <div className="text-xs font-medium uppercase text-zinc-500">
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

function ProblemSection() {
  return (
    <section className="border-b border-zinc-200 bg-[#fbfcfe]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionIntro
          eyebrow="Problem"
          title="Agent platforms keep context disconnected."
          description="AFS gives agents a portable way to share traces, context, knowledge, and source provenance without locking the team into one harness or database."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
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
      </div>
    </section>
  )
}

function StandardLayers() {
  return (
    <section className="border-b border-zinc-200 bg-[#f7f9fc]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionIntro
          eyebrow="The standard"
          title="A small set of paths that every agent can understand."
          description="AFS separates memory, operations, and current source-of-truth material so context can be added without turning a repository or company workspace into an unstructured dump."
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
                <h3 className="font-heading text-base font-semibold">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {principle.description}
                </p>
              </article>
            )
          })}
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
          description="The folder standard stores evidence and knowledge. Root Markdown files define operating rules, product direction, taste, loops, values, gaps, risk, and current status."
        />
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rootFiles.slice(0, 12).map((item) => {
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

function InstallationPreview() {
  return (
    <section className="border-b border-zinc-200 bg-[#eef6f2]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Badge variant="outline" className="border-emerald-300 bg-white">
              use-afs
            </Badge>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Install the standard as files, templates, scripts, and agent
              guidance.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-700">
              The new use-afs skill carries the standard, usage instructions,
              compatibility bridges, validation scripts, migration helpers, and
              hooks for agent harnesses that support them.
            </p>
          </div>
          <div className="grid gap-4">
            {installationOptions.map((option) => {
              const Icon = option.icon

              return (
                <article
                  key={option.title}
                  className="rounded-[8px] border border-emerald-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-800">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-semibold">
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
        </div>
      </div>
    </section>
  )
}

function CompatibilityPreview() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <SectionIntro
          eyebrow="Compatibility"
          title="Adapter files let other agent systems point back to the same AFS source."
          description="Compatibility is implemented as plain Markdown bridge templates. Gbrain and QMD support is best-effort and file-based until official integration surfaces are available."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {compatibilityTargets.map((target) => {
            const Icon = target.icon

            return (
              <article
                key={target.name}
                className="rounded-[8px] border border-zinc-200 bg-[#fbfcfe] p-5"
              >
                <Icon className="mb-4 size-5 text-zinc-800" aria-hidden="true" />
                <Badge variant="secondary">{target.status}</Badge>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {target.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {target.description}
                </p>
              </article>
            )
          })}
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          <Badge variant="outline">
            <CheckCircle2 aria-hidden="true" />
            root-readable
          </Badge>
          <Badge variant="outline">
            <Search aria-hidden="true" />
            source-backed
          </Badge>
          <Badge variant="outline">
            <FolderTree aria-hidden="true" />
            plain files
          </Badge>
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
        <p className="text-sm font-medium uppercase text-zinc-500">{eyebrow}</p>
      </div>
      <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-zinc-600">{description}</p>
    </div>
  )
}

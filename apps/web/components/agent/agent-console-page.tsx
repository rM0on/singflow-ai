"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  Bot,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Loader2,
  ShieldCheck,
  TerminalSquare
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import type { AgentStep, AgentStepStatus } from "@/lib/mock-data";
import { agentRun, agentSteps } from "@/lib/mock-data";

const columnHelper = createColumnHelper<AgentStep>();

function statusVariant(status: AgentStepStatus) {
  if (status === "completed") return "mint";
  if (status === "running") return "cyan";
  if (status === "warning") return "amber";
  return "default";
}

function StatusBadge({ status }: { status: AgentStepStatus }) {
  const Icon =
    status === "completed" ? CheckCircle2 : status === "running" ? Loader2 : CircleDashed;

  return (
    <Badge variant={statusVariant(status)}>
      <Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {status}
    </Badge>
  );
}

const columns = [
  columnHelper.accessor("tool", {
    header: "Tool",
    cell: (info) => <span className="font-medium text-[#F7F8FA]">{info.getValue()}</span>
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />
  }),
  columnHelper.accessor("latencyMs", {
    header: "Latency",
    cell: (info) => (
      <span className="tabular-nums text-[#C9D0DD]">{info.getValue()} ms</span>
    )
  }),
  columnHelper.accessor("inputSummary", {
    header: "Input summary",
    cell: (info) => <span className="text-[#AEB4C2]">{info.getValue()}</span>
  }),
  columnHelper.accessor("outputSummary", {
    header: "Output summary",
    cell: (info) => <span className="text-[#AEB4C2]">{info.getValue()}</span>
  })
];

export function AgentConsolePage() {
  const table = useReactTable({
    data: agentSteps,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShell
      eyebrow="Agent Console Preview"
      title="Trace the mock Agent run without exposing chain-of-thought."
      description="Phase 1 uses safe summaries to preview persisted Agent runs and tool calls. No real backend, LLM, or hidden reasoning is connected."
      aside={<StateStrip />}
    >
      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 xl:sticky xl:top-8">
          <section className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Run capsule</h2>
                <p className="mt-1 text-sm text-[#9EA6B7]">{agentRun.mode}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-accent-violet/20 bg-accent-violet/[0.08]">
                <Bot className="h-5 w-5 text-accent-violet" />
              </span>
            </div>

            <dl className="mt-5 grid gap-3">
              {[
                ["run id", agentRun.id],
                ["status", agentRun.status],
                ["started", agentRun.startedAt],
                ["latency", `${agentRun.totalLatencyMs} ms`]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-card border border-white/[0.08] bg-[#0A0D13] p-3"
                >
                  <dt className="text-[11px] text-[#858C9D]">{label}</dt>
                  <dd className="mt-2 break-words text-sm text-[#DDE2EC]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <LoadingState label="Waiting for the next mock tool event." />
          <EmptyState
            title="No Agent run selected"
            description="The console can show an empty state before a session produces or selects a run."
          />
          <section className="rounded-panel border border-white/[0.08] bg-[#0D1017] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent-mint" />
              Safe summaries only
            </div>
            <p className="mt-3 text-sm leading-6 text-[#AEB4C2]">
              The console shows sanitized input and output summaries only. It does
              not display chain-of-thought or provider payloads.
            </p>
          </section>
        </aside>

        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Tool-call timeline</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Ordered mock steps mirror the future `agent_runs` and `agent_steps` model.
              </p>
            </div>
            <Badge variant="violet">
              <TerminalSquare className="h-3 w-3" />
              7 steps
            </Badge>
          </div>

          <div className="mt-6 space-y-3">
            {agentSteps.map((step, index) => (
              <article
                key={step.id}
                className="group relative grid gap-3 overflow-hidden rounded-card border border-white/[0.08] bg-[#0A0D13] p-4 transition hover:-translate-y-px hover:border-accent-violet/28 hover:bg-white/[0.052] md:grid-cols-[52px_minmax(0,1fr)_120px]"
              >
                <div className="absolute left-[25px] top-16 hidden h-full w-px bg-gradient-to-b from-accent-violet/45 to-transparent md:block" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-card border border-white/[0.1] bg-white/[0.045] text-sm text-accent-cyan">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{step.tool}</h3>
                    <StatusBadge status={step.status} />
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="border-l border-white/[0.12] pl-3">
                      <p className="text-[11px] text-[#858C9D]">input summary</p>
                      <p className="mt-1 text-sm leading-6 text-[#AEB4C2]">
                        {step.inputSummary}
                      </p>
                    </div>
                    <div className="border-l border-accent-cyan/20 pl-3">
                      <p className="text-[11px] text-[#858C9D]">output summary</p>
                      <p className="mt-1 text-sm leading-6 text-[#AEB4C2]">
                        {step.outputSummary}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#8F97A8] md:justify-end">
                  <Clock3 className="h-4 w-4" />
                  <span className="tabular-nums">{step.latencyMs} ms</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 overflow-hidden rounded-panel border border-white/[0.08] bg-[#0A0D13]">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.035] px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Inspection matrix</h3>
                <p className="mt-1 text-xs text-[#8F97A8]">
                  Same data, denser scan mode for engineering review.
                </p>
              </div>
              <Badge>TanStack Table</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] text-left text-sm">
                <thead className="text-xs text-[#858C9D]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 font-medium">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="transition hover:bg-white/[0.035]">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="max-w-[270px] px-4 py-4 align-top">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

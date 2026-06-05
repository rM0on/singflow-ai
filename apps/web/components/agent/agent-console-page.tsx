"use client";

import { useQuery } from "@tanstack/react-query";
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
import {
  adaptAgentRunToConsoleRun,
  adaptAgentStepToMockStep,
  getAgentRun,
  getAgentRuns,
  getAgentRunSteps,
  getApiStatusLabel,
  isAgentRunUsable,
  isAgentStepsUsable
} from "@/lib/api";
import type {
  AgentConsoleRunViewModel,
  AgentRunApiItem,
  AgentRunDetailApiResponse,
  AgentStepApiItem,
  ApiConnectionState,
  ApiResult,
  ListResponse
} from "@/lib/api";
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

const statusLegend: Array<{ label: AgentStepStatus; hint: string }> = [
  { label: "completed", hint: "persisted summary" },
  { label: "running", hint: "active mock step" },
  { label: "queued", hint: "waiting for output" }
];

export function AgentConsolePage() {
  const runsQuery = useQuery({
    queryKey: ["agent-console", "agent-runs"],
    queryFn: () => getAgentRuns({ limit: 5 }),
    retry: false
  });
  const runsResult = runsQuery.data;
  const selectedApiRun = runsResult?.ok ? runsResult.data.items[0] : null;
  const selectedRunId = selectedApiRun?.id;
  const detailQuery = useQuery({
    queryKey: ["agent-console", "agent-run", selectedRunId],
    queryFn: () => getAgentRun(selectedRunId ?? ""),
    enabled: Boolean(selectedRunId),
    retry: false
  });
  const stepsQuery = useQuery({
    queryKey: ["agent-console", "agent-run-steps", selectedRunId],
    queryFn: () => getAgentRunSteps(selectedRunId ?? ""),
    enabled: Boolean(selectedRunId),
    retry: false
  });
  const detailResult = detailQuery.data;
  const stepsResult = stepsQuery.data;
  const apiDetail = detailResult?.ok ? detailResult.data : null;
  const apiSteps = stepsResult?.ok ? stepsResult.data.items : null;
  const hasApiRun = isAgentRunUsable(selectedApiRun, apiDetail);
  const hasApiSteps = isAgentStepsUsable(apiSteps);
  const isApiConnected = Boolean(hasApiRun && hasApiSteps && selectedApiRun && apiDetail && apiSteps);
  const displayedRun =
    isApiConnected && selectedApiRun && apiDetail
      ? adaptAgentRunToConsoleRun(selectedApiRun, apiDetail)
      : adaptMockAgentRun();
  const displayedSteps =
    isApiConnected && apiSteps ? apiSteps.map(adaptAgentStepToMockStep) : agentSteps;
  const apiState = resolveAgentConsoleApiState({
    runsResult,
    detailResult,
    stepsResult,
    hasApiData: isApiConnected,
    isLoading: runsQuery.isLoading || detailQuery.isLoading || stepsQuery.isLoading
  });
  const table = useReactTable({
    data: displayedSteps,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <AppShell
      eyebrow="Agent Console Preview"
      title="Trace the Agent run through safe summaries."
      description="Phase 2H-3 reads persisted Agent Run GET data when available and keeps the mock fallback. No real LLM or live workflow is connected."
      aside={<StateStrip apiState={apiState} apiLabel={getApiStatusLabel(apiState)} />}
    >
      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 xl:sticky xl:top-8">
          <section className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Run capsule</h2>
                <p className="mt-1 text-sm text-[#9EA6B7]">{displayedRun.mode}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-accent-violet/20 bg-accent-violet/[0.08]">
                <Bot className="h-5 w-5 text-accent-violet" />
              </span>
            </div>

            <dl className="mt-5 grid gap-3">
              {[
                ["run id", displayedRun.id],
                ["status", displayedRun.status],
                ["started", displayedRun.startedAt],
                ["latency", `${displayedRun.totalLatencyMs} ms`]
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

          <LoadingState
            label={
              apiState === "connected"
                ? "Reading persisted Agent run summaries."
                : "Waiting for the next mock tool event."
            }
          />
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
              not display hidden reasoning or provider internals.
            </p>
          </section>
        </aside>

        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Tool-call timeline</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Ordered steps mirror the persisted `agent_runs` and `agent_steps` model.
              </p>
            </div>
            <Badge variant="violet">
              <TerminalSquare className="h-3 w-3" />
              {displayedSteps.length} steps
            </Badge>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {statusLegend.map((item) => (
              <div
                key={item.label}
                className="rounded-card border border-white/[0.08] bg-[#0A0D13] px-3 py-2"
              >
                <StatusBadge status={item.label} />
                <p className="mt-2 text-xs text-[#8F97A8]">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {displayedSteps.map((step, index) => (
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
            <div className="grid gap-2 border-b border-white/[0.08] px-4 py-3 text-xs text-[#8F97A8] md:grid-cols-3">
              <span>Source: {isApiConnected ? "Backend Agent Run GET API" : "Phase 1 mock Agent Run"}</span>
              <span>Visibility: sanitized summaries only</span>
              <span>Rows: {displayedSteps.length} ordered tool steps</span>
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

function adaptMockAgentRun(): AgentConsoleRunViewModel {
  return {
    id: agentRun.id,
    mode: agentRun.mode,
    objective: agentRun.objective,
    status: agentRun.status,
    startedAt: agentRun.startedAt,
    totalLatencyMs: agentRun.totalLatencyMs,
    stepsCount: agentSteps.length
  };
}

function resolveAgentConsoleApiState({
  runsResult,
  detailResult,
  stepsResult,
  hasApiData,
  isLoading
}: {
  runsResult: ApiResult<ListResponse<AgentRunApiItem>> | undefined;
  detailResult: ApiResult<AgentRunDetailApiResponse> | undefined;
  stepsResult: ApiResult<ListResponse<AgentStepApiItem>> | undefined;
  hasApiData: boolean;
  isLoading: boolean;
}): ApiConnectionState {
  if (hasApiData) {
    return "connected";
  }

  if (!isLoading && (runsResult || detailResult || stepsResult)) {
    return "fallback";
  }

  return "mock";
}

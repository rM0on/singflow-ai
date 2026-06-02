"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Activity, Brain, Gauge, Heart, Radio, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import {
  agentPerformance,
  dashboardMetrics,
  feedbackDistribution,
  tasteEvolution
} from "@/lib/mock-data";

const chartColors = ["#2FE6A6", "#66D9EF", "#9B8CFF", "#FF6B6B"];
const metricIcons = [Activity, Heart, Gauge, Brain];

const tooltipStyle = {
  background: "#0D1017",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#F7F8FA"
};

const insights = [
  "High-energy songs perform best after two confidence-building rotations.",
  "Chorus-friendly feedback is rising faster than solo-vocal preference.",
  "Agent ranking latency stays below the portfolio demo target."
];

const memoryLoop = ["Feedback", "Taste profile", "Ranking", "Next session"];

export function DashboardPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  return (
    <AppShell
      eyebrow="Dashboard / Feedback Memory"
      title="Read the mock memory loop like a product surface, not an admin table."
      description="Phase 1 visualizes feedback, taste profile movement, and Agent performance from static data only."
      aside={<StateStrip />}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metricIcons[index];
          return (
            <article
              key={metric.label}
              className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.024))] p-5 transition hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.055]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-card border border-white/[0.08] bg-white/[0.04]">
                  <Icon className="h-4 w-4 text-accent-cyan" />
                </span>
                <Badge variant="mint">{metric.delta}</Badge>
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-normal">{metric.value}</p>
              <p className="mt-1 text-sm text-[#9EA6B7]">{metric.label}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-panel border border-white/[0.08] bg-[linear-gradient(90deg,rgba(102,217,239,0.08),rgba(47,230,166,0.05),rgba(155,140,255,0.06))] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Feedback memory loop</h2>
            <p className="mt-1 text-sm text-[#AEB4C2]">
              Static mock signals show how future backend data will move from feedback to better sessions.
            </p>
          </div>
          <Badge variant="cyan">closed-loop preview</Badge>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {memoryLoop.map((step, index) => (
            <div
              key={step}
              className="rounded-card border border-white/[0.08] bg-black/20 px-3 py-3"
            >
              <p className="text-xs text-[#858C9D]">0{index + 1}</p>
              <p className="mt-1 text-sm font-medium text-[#F7F8FA]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-panel border border-white/[0.08] bg-[#0D1017]/92 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Feedback distribution</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Mock feedback categories that later feed taste memory.
              </p>
            </div>
            <Badge variant="cyan">memory signals</Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
            <div className="h-[320px] min-h-[320px] min-w-0 rounded-panel border border-white/[0.08] bg-[radial-gradient(circle_at_50%_48%,rgba(47,230,166,0.11),transparent_42%),rgba(255,255,255,0.02)]">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feedbackDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={76}
                      outerRadius={118}
                      paddingAngle={4}
                    >
                      {feedbackDistribution.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={chartColors[index % chartColors.length]}
                          stroke="rgba(255,255,255,0.08)"
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#9EA6B7]">
                  Loading feedback chart...
                </div>
              )}
            </div>

            <div className="grid content-center gap-2">
              {feedbackDistribution.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-card border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-[#DDE2EC]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    {item.name}
                  </span>
                  <span className="tabular-nums text-[#9EA6B7]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Taste profile evolution</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Static trend lines show how feedback memory can become visible.
              </p>
            </div>
            <Badge variant="violet">
              <TrendingUp className="h-3 w-3" />
              5 weeks
            </Badge>
          </div>
          <div className="mt-5 h-[360px] min-h-[360px] min-w-0 rounded-panel border border-white/[0.08] bg-[#0A0D13] p-3">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tasteEvolution}>
                  <defs>
                    <linearGradient id="chorusFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#66D9EF" stopOpacity={0.26} />
                      <stop offset="95%" stopColor="#66D9EF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="nostalgicFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B8CFF" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#9B8CFF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2FE6A6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2FE6A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="week" stroke="#858C9D" tickLine={false} axisLine={false} />
                  <YAxis stroke="#858C9D" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="chorus"
                    stroke="#66D9EF"
                    fill="url(#chorusFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="nostalgic"
                    stroke="#9B8CFF"
                    fill="url(#nostalgicFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="highEnergy"
                    stroke="#2FE6A6"
                    fill="url(#energyFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#9EA6B7]">
                Loading taste chart...
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="cyan">chorus</Badge>
            <Badge variant="violet">nostalgic</Badge>
            <Badge variant="mint">high energy</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Agent performance summary</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Tool latency and success are product health signals for the workflow.
              </p>
            </div>
            <Badge variant="amber">mock telemetry</Badge>
          </div>
          <div className="mt-5 h-[320px] min-h-[320px] min-w-0 rounded-panel border border-white/[0.08] bg-[#0A0D13] p-3">
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance}>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="tool" stroke="#858C9D" tickLine={false} axisLine={false} />
                  <YAxis stroke="#858C9D" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="latency" fill="#66D9EF" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="success" fill="#2FE6A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#9EA6B7]">
                Loading performance chart...
              </div>
            )}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <section className="rounded-panel border border-white/[0.08] bg-[#0D1017] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Radio className="h-4 w-4 text-accent-cyan" />
              Product insights
            </div>
            <div className="mt-4 space-y-3">
              {insights.map((insight, index) => (
                <p key={insight} className="border-l border-white/[0.12] pl-3 text-sm leading-6 text-[#B8BECC]">
                  <span className="mr-2 text-accent-cyan">0{index + 1}</span>
                  {insight}
                </p>
              ))}
            </div>
          </section>
          <LoadingState label="Aggregating mock memory signals." />
          <EmptyState
            title="No feedback yet"
            description="Before any feedback is stored, the dashboard can show guidance instead of empty metrics."
          />
        </div>
      </section>
    </AppShell>
  );
}

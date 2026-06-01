"use client";

import { motion } from "framer-motion";
import { Clock3, Command, Gauge, Loader2, Mic2, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import { playlistPhases, plannerConstraints } from "@/lib/mock-data";
import { useStudioStore } from "@/lib/studio-store";

const flowStats = [
  { label: "singers", value: "6" },
  { label: "target time", value: "90m" },
  { label: "languages", value: "4" },
  { label: "phase count", value: "5" }
];

export function SessionPlannerPage() {
  const { plannerPrompt, setPlannerPrompt, energyCurve, setEnergyCurve } =
    useStudioStore();

  return (
    <AppShell
      eyebrow="AI Session Planner"
      title="Shape a karaoke session before any recommendation is generated."
      description="This Phase 1 page demonstrates the structured planning layer: natural language input, visible constraints, and a mock flow plan."
      aside={<StateStrip />}
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.024))] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Command planner</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Mock input only. No LLM or backend request is made in Phase 1.
              </p>
            </div>
            <Badge variant="cyan">
              <Sparkles className="h-3 w-3" />
              mock generation
            </Badge>
          </div>

          <div className="mt-5 rounded-[16px] border border-white/[0.1] bg-[#080B10]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-start gap-3 rounded-card border border-white/[0.08] bg-white/[0.045] p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-accent-cyan/20 bg-accent-cyan/[0.08] text-accent-cyan">
                <Command className="h-4 w-4" />
              </span>
              <textarea
                value={plannerPrompt}
                onChange={(event) => setPlannerPrompt(event.target.value)}
                rows={7}
                aria-label="Natural language scene input"
                className="w-full resize-none bg-transparent text-[15px] leading-7 text-[#F7F8FA] outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["rise-peak-soft", "Rise, peak, soft landing"],
              ["steady-cruise", "Steady cruise"],
              ["warm-social", "Warm social"]
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setEnergyCurve(id as typeof energyCurve)}
                className={`rounded-card border px-4 py-3 text-left text-sm transition hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.055] ${
                  energyCurve === id
                    ? "border-accent-mint/30 bg-[linear-gradient(90deg,rgba(47,230,166,0.12),rgba(255,255,255,0.035))] text-foreground"
                    : "border-white/[0.08] bg-white/[0.03] text-[#AEB4C2]"
                }`}
              >
                <Gauge className="mb-3 h-4 w-4 text-accent-cyan" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#DDE2EC]">Constraint chips</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {plannerConstraints.map((constraint) => (
                <Badge key={constraint}>{constraint}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {flowStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-white/[0.08] bg-black/20 p-4 transition hover:border-accent-mint/28 hover:bg-white/[0.05]"
              >
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-[#858C9D]">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-5">
          <section className="rounded-panel border border-white/[0.08] bg-[#0D1017] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generation state</h2>
              <Badge variant="amber">
                <Loader2 className="h-3 w-3 animate-spin" />
                preview
              </Badge>
            </div>
            <div className="mt-5 space-y-3">
              {["Parse scene", "Apply constraints", "Draft phase flow", "Prepare reasons"].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-card border border-white/[0.08] bg-white/[0.035] p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-card bg-white/[0.06] text-sm text-accent-cyan">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step}</p>
                      <p className="mt-1 text-xs text-[#8F97A8]">
                        {index < 2 ? "completed" : "mock loading state"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <LoadingState label="Composing a safe fictional metadata flow." />
          <EmptyState
            title="No constraints selected"
            description="The planner can still draft a session, but it will show a prompt to add language, duration, or difficulty constraints."
          />
        </div>
      </section>

      <section className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Generated karaoke flow structure</h2>
            <p className="mt-1 text-sm text-[#9EA6B7]">
              A structured mock plan that later backend phases can persist as a session.
            </p>
          </div>
          <Badge variant="mint">
            <Clock3 className="h-3 w-3" />
            90 min
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {playlistPhases.map((phase, index) => (
            <article
              key={phase.id}
              className="rounded-card border border-white/[0.08] bg-[#0A0D13] p-4 transition hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.052]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-card border border-white/[0.08] bg-white/[0.04]">
                <Mic2 className="h-4 w-4 text-accent-cyan" />
              </div>
              <p className="mt-4 text-xs text-[#858C9D]">Act {index + 1}</p>
              <h3 className="mt-1 font-semibold">{phase.name}</h3>
              <p className="mt-2 text-xs text-[#858C9D]">{phase.duration}</p>
              <p className="mt-3 text-sm leading-6 text-[#B8BECC]">{phase.intent}</p>
              <Badge className="mt-4" variant="violet">
                energy {phase.energyLabel}
              </Badge>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

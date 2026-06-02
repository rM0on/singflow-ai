"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  AlertTriangle,
  AudioWaveform,
  Languages,
  Scale,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import { demoMembers, fusionRadarData, groupCompromises } from "@/lib/mock-data";

const fusionFields = [
  { label: "Chorus comfort", value: 86, color: "bg-accent-mint" },
  { label: "Language spread", value: 82, color: "bg-accent-cyan" },
  { label: "Peak tolerance", value: 78, color: "bg-accent-coral" },
  { label: "Nostalgic pull", value: 64, color: "bg-accent-violet" }
];

export function GroupTasteMixerPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  return (
    <AppShell
      eyebrow="Group Taste Mixer"
      title="Fuse several singers into one explainable group preference."
      description="This static mixer shows member weights, preference tags, conflict handling, and a mock fusion profile without calling a backend."
      aside={<StateStrip />}
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.94fr)_minmax(440px,1.06fr)]">
        <div className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.044),rgba(255,255,255,0.022))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Member preference lanes</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Weighted taste profiles become visible before the playlist is ranked.
              </p>
            </div>
            <Badge variant="cyan">
              <UsersRound className="h-3 w-3" />
              4 profiles
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {demoMembers.map((member) => (
              <article
                key={member.id}
                className="group overflow-hidden rounded-card border border-white/[0.08] bg-[#0A0D13] p-4 transition hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.052]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[radial-gradient(circle_at_35%_20%,rgba(102,217,239,0.24),transparent_44%),rgba(255,255,255,0.045)] text-sm font-semibold text-[#DDE2EC]">
                      {member.name.slice(0, 1)}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold">{member.name}</h3>
                      <p className="mt-1 text-sm text-[#8F97A8]">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant="mint">{Math.round(member.weight * 100)}% weight</Badge>
                </div>

                <div className="mt-4 h-1 rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-mint"
                    style={{ width: `${Math.round(member.weight * 100)}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-card border border-white/[0.07] bg-white/[0.026] p-3">
                    <Languages className="mb-2 h-4 w-4 text-accent-cyan" />
                    <p className="text-[#DDE2EC]">{member.languages.join(" / ")}</p>
                  </div>
                  <div className="rounded-card border border-white/[0.07] bg-white/[0.026] p-3">
                    <Scale className="mb-2 h-4 w-4 text-accent-violet" />
                    <p className="text-[#DDE2EC]">{member.difficulty}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="rounded-panel border border-white/[0.08] bg-[#0D1017]/92 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Fusion profile</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Radar compares group preference pressure with comfort boundaries.
              </p>
            </div>
            <Badge variant="violet">
              <SlidersHorizontal className="h-3 w-3" />
              explainable
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div className="h-[380px] min-h-[380px] min-w-0 rounded-panel border border-white/[0.08] bg-[radial-gradient(circle_at_50%_45%,rgba(102,217,239,0.12),transparent_44%),rgba(255,255,255,0.025)] p-3">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={fusionRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "#AEB4C2", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#0D1017",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8,
                        color: "#F7F8FA"
                      }}
                    />
                    <Radar
                      name="Group"
                      dataKey="group"
                      stroke="#66D9EF"
                      fill="#66D9EF"
                      fillOpacity={0.24}
                    />
                    <Radar
                      name="Comfort"
                      dataKey="comfort"
                      stroke="#2FE6A6"
                      fill="#2FE6A6"
                      fillOpacity={0.14}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#9EA6B7]">
                  Loading fusion chart...
                </div>
              )}
            </div>

            <div className="grid content-start gap-3">
              <div className="rounded-card border border-white/[0.08] bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AudioWaveform className="h-4 w-4 text-accent-cyan" />
                  Group taste field
                </div>
                <p className="mt-2 text-xs leading-5 text-[#8F97A8]">
                  Weighted blend: language comfort, chorus confidence, energy tolerance.
                </p>
                <div className="mt-4 space-y-3">
                  {fusionFields.map((field) => (
                    <div key={field.label}>
                      <div className="flex justify-between text-xs text-[#AEB4C2]">
                        <span>{field.label}</span>
                        <span>{field.value}</span>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-white/[0.07]">
                        <div
                          className={`h-full rounded-full ${field.color}`}
                          style={{ width: `${field.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-card border border-accent-mint/20 bg-accent-mint/[0.06] p-4">
                <p className="text-xs text-accent-mint">Fusion confidence</p>
                <p className="mt-1 text-2xl font-semibold text-[#F7F8FA]">0.78</p>
                <p className="mt-2 text-xs leading-5 text-[#9EA6B7]">
                  Strong enough to rank, still keeps compromise notes visible.
                </p>
              </div>
              <LoadingState label="Recalculating member weights." />
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Compromise matrix</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Tradeoffs stay visible so group fusion does not feel like a black box.
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-accent-amber" />
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {groupCompromises.map((item, index) => (
              <article
                key={item.conflict}
                className="rounded-card border border-white/[0.08] bg-[#0A0D13] p-4 transition hover:-translate-y-px hover:border-accent-amber/30 hover:bg-white/[0.052]"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber">conflict {index + 1}</Badge>
                  <span className="h-px w-12 bg-gradient-to-r from-accent-amber/60 to-transparent" />
                </div>
                <p className="mt-3 text-sm leading-6 text-[#DDE2EC]">{item.conflict}</p>
                <div className="my-4 h-px bg-white/[0.08]" />
                <Badge variant="mint">playlist compromise</Badge>
                <p className="mt-3 text-sm leading-6 text-[#B8BECC]">{item.compromise}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-4">
          <EmptyState
            title="No members selected"
            description="The mixer can display an empty group state before a demo session chooses participants."
          />
          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-[#F7F8FA]">Explainability rule</p>
            <p className="mt-3 text-sm leading-6 text-[#AEB4C2]">
              The UI explains pressure, comfort, and compromise without assigning
              blame to a single member.
            </p>
          </section>
        </div>
      </section>
    </AppShell>
  );
}

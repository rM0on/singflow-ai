"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  Loader2,
  Scale,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import {
  adaptSessionMembersToMixerMembers,
  adaptTasteFusionToMixerView,
  getApiStatusLabel,
  getFirstUsableKaraokeSession,
  getKaraokeSessionMembers,
  getKaraokeSessions,
  isMixerMembersUsable,
  isTasteFusionResponseUsable,
  runTasteFusion
} from "@/lib/api";
import type {
  ApiConnectionState,
  MixerMemberViewModel,
  TasteFusionRequest,
  TasteFusionViewModel
} from "@/lib/api";
import { demoMembers, fusionRadarData, groupCompromises } from "@/lib/mock-data";

const fusionFields = [
  { label: "Chorus comfort", value: 86, color: "bg-accent-mint" },
  { label: "Language spread", value: 82, color: "bg-accent-cyan" },
  { label: "Peak tolerance", value: 78, color: "bg-accent-coral" },
  { label: "Nostalgic pull", value: 64, color: "bg-accent-violet" }
];

export function GroupTasteMixerPage() {
  const [chartsReady, setChartsReady] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const sessionsQuery = useQuery({
    queryKey: ["mixer", "karaoke-sessions"],
    queryFn: () => getKaraokeSessions({ limit: 5 }),
    retry: false
  });
  const sessionsResult = sessionsQuery.data;
  const selectedApiSession =
    sessionsResult?.ok ? getFirstUsableKaraokeSession(sessionsResult.data.items) : null;
  const selectedSessionId = selectedApiSession?.id;
  const membersQuery = useQuery({
    queryKey: ["mixer", "karaoke-session-members", selectedSessionId],
    queryFn: () => getKaraokeSessionMembers(selectedSessionId ?? ""),
    enabled: Boolean(selectedSessionId),
    retry: false
  });
  const fusionMutation = useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: TasteFusionRequest }) =>
      runTasteFusion(sessionId, payload),
    retry: false
  });
  const membersResult = membersQuery.data;
  const apiMembers =
    membersResult?.ok && isMixerMembersUsable(membersResult.data.items)
      ? adaptSessionMembersToMixerMembers(membersResult.data.items)
      : null;
  const fusionResult = fusionMutation.data;
  const fusionView =
    fusionResult?.ok && isTasteFusionResponseUsable(fusionResult.data, selectedSessionId)
      ? adaptTasteFusionToMixerView(fusionResult.data)
      : null;
  const fusionFallback =
    fallbackMessage ||
    (fusionResult && !fusionView
      ? "Local taste fusion is unavailable; showing the mock mixer preview."
      : null);
  const apiState = resolveMixerApiState({
    hasMembers: Boolean(apiMembers?.length),
    hasFusion: Boolean(fusionView),
    hasFallback: Boolean(fusionFallback),
    hasApiAttempt: Boolean(sessionsResult || membersResult || fusionResult),
    isLoading: sessionsQuery.isLoading || membersQuery.isLoading || fusionMutation.isPending
  });
  const displayedMembers = apiMembers ?? demoMembers.map(adaptMockMemberToMixerMember);
  const displayedFusionFields = getDisplayedFusionFields(fusionView);
  const displayedConflicts = getDisplayedConflicts(fusionView);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  function handleRunFusion() {
    if (fusionMutation.isPending) {
      return;
    }

    if (!selectedApiSession || !apiMembers?.length) {
      fusionMutation.reset();
      setFallbackMessage("Backend session members unavailable; using the mock mixer preview.");
      return;
    }

    setFallbackMessage(null);
    const memberOverrides = apiMembers.flatMap((member) =>
      member.userId
        ? [
            {
              user_id: member.userId,
              preference_weight: member.weight
            }
          ]
        : []
    );

    fusionMutation.mutate({
      sessionId: selectedApiSession.id,
      payload: {
        scene_type: selectedApiSession.scene_type,
        energy_curve: selectedApiSession.target_energy_curve ?? "ramp_up",
        ...(memberOverrides.length > 0 ? { member_overrides: memberOverrides } : {})
      }
    });
  }

  return (
    <AppShell
      eyebrow="Group Taste Mixer"
      title="Fuse several singers into one explainable group preference."
      description="Phase 3B can read backend session members and run deterministic mock taste fusion while preserving the mock mixer preview."
      aside={<StateStrip apiState={apiState} apiLabel={getApiStatusLabel(apiState)} />}
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
              {displayedMembers.length} profiles
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {displayedMembers.map((member) => (
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
                  <Badge variant="mint">{member.weightLabel}</Badge>
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
                    <p className="text-[#DDE2EC]">{member.difficultyLabel}</p>
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
            <div className="flex items-center gap-2">
              <Badge variant={fusionView ? "mint" : fusionFallback ? "amber" : "violet"}>
                <SlidersHorizontal className="h-3 w-3" />
                {fusionView ? "local fusion" : fusionFallback ? "mock fallback" : "explainable"}
              </Badge>
              <button
                type="button"
                onClick={handleRunFusion}
                disabled={fusionMutation.isPending}
                className="inline-flex items-center gap-2 rounded-card border border-accent-cyan/25 bg-accent-cyan/[0.1] px-3 py-2 text-sm font-medium text-[#F7F8FA] transition hover:-translate-y-px hover:border-accent-cyan/45 hover:bg-accent-cyan/[0.15] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {fusionMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                )}
                Run local fusion
              </button>
            </div>
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
                  {fusionView
                    ? fusionView.consensusSummary
                    : "Weighted blend: language comfort, chorus confidence, energy tolerance."}
                </p>
                <div className="mt-4 space-y-3">
                  {displayedFusionFields.map((field) => (
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
                <p className="mt-1 text-2xl font-semibold text-[#F7F8FA]">
                  {fusionView ? fusionView.confidenceLabel.replace(" derived confidence", "") : "0.78"}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#9EA6B7]">
                  {fusionView
                    ? `${fusionView.workflowLabel}; backend scores adapted into a safe preview.`
                    : "Strong enough to rank, still keeps compromise notes visible."}
                </p>
              </div>
              <LoadingState
                label={
                  fusionMutation.isPending
                    ? "Running local mock taste fusion."
                    : apiState === "connected"
                      ? "Reading backend member weights."
                      : "Recalculating mock member weights."
                }
              />
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
            {displayedConflicts.map((item, index) => (
              <article
                key={item.conflict}
                className="rounded-card border border-white/[0.08] bg-[#0A0D13] p-4 transition hover:-translate-y-px hover:border-accent-amber/30 hover:bg-white/[0.052]"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber">{fusionView ? "fusion conflict" : `conflict ${index + 1}`}</Badge>
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
            {fusionFallback ? (
              <p className="mt-3 text-xs leading-5 text-accent-amber">{fusionFallback}</p>
            ) : null}
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function adaptMockMemberToMixerMember(member: (typeof demoMembers)[number]): MixerMemberViewModel {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    weight: member.weight,
    weightLabel: `${Math.round(member.weight * 100)}% weight`,
    languages: member.languages,
    difficultyLabel: member.difficulty,
    tags: member.tags,
    confidenceLabel: "Mock profile"
  };
}

function getDisplayedFusionFields(fusionView: TasteFusionViewModel | null) {
  if (!fusionView) {
    return fusionFields;
  }

  const language = fusionView.languages[0];
  const genre = fusionView.genres[0];
  const energyMiddle =
    fusionView.energyTarget.find((item) => item.label === "Middle") ?? fusionView.energyTarget[0];

  return [
    {
      label: language ? `${language.label} language` : "Language blend",
      value: language?.value ?? 0,
      color: "bg-accent-cyan"
    },
    {
      label: genre ? `${genre.label} consensus` : "Genre consensus",
      value: genre?.value ?? 0,
      color: "bg-accent-mint"
    },
    {
      label: energyMiddle ? `${energyMiddle.label} energy` : "Energy target",
      value: energyMiddle?.value ?? 0,
      color: "bg-accent-coral"
    },
    {
      label: "Fusion confidence",
      value: Number.parseInt(fusionView.confidenceLabel, 10) || 0,
      color: "bg-accent-violet"
    }
  ];
}

function getDisplayedConflicts(fusionView: TasteFusionViewModel | null) {
  if (!fusionView) {
    return groupCompromises;
  }

  if (!fusionView.conflicts.length) {
    return [
      {
        conflict: "No major conflicts returned by local mock fusion.",
        compromise: "Keep the visible mock compromise notes available for product review."
      }
    ];
  }

  return fusionView.conflicts.map((conflict) => ({
    conflict: `${conflict.dimension}: ${conflict.summary}`,
    compromise: "Review this dimension before ranking the next mock playlist."
  }));
}

function resolveMixerApiState({
  hasMembers,
  hasFusion,
  hasFallback,
  hasApiAttempt,
  isLoading
}: {
  hasMembers: boolean;
  hasFusion: boolean;
  hasFallback: boolean;
  hasApiAttempt: boolean;
  isLoading: boolean;
}): ApiConnectionState {
  if (hasFusion || hasMembers) {
    return "connected";
  }

  if (!isLoading && (hasFallback || hasApiAttempt)) {
    return "fallback";
  }

  return "mock";
}

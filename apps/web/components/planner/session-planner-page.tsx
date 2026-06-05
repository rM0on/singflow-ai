"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Command,
  Gauge,
  ListMusic,
  Loader2,
  Mic2,
  Sparkles
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import {
  adaptGeneratedPlaylistToPlannerPreview,
  generatePlaylist,
  getApiStatusLabel,
  getDemoUsers,
  getFirstUsableKaraokeSession,
  getKaraokeSessions,
  isPlaylistGenerateResponseUsable
} from "@/lib/api";
import type {
  ApiConnectionState,
  GeneratedPlaylistPreviewViewModel,
  Language,
  PlaylistGenerateRequest,
  TargetEnergyCurve
} from "@/lib/api";
import { playlistPhases, plannerConstraints } from "@/lib/mock-data";
import { useStudioStore } from "@/lib/studio-store";

const flowStats = [
  { label: "singers", value: "6" },
  { label: "target time", value: "90m" },
  { label: "languages", value: "4" },
  { label: "phase count", value: "5" }
];

const promptHints = ["KTV room", "mixed confidence", "chorus-friendly", "late-night finale"];

const parserSignals = [
  ["Scene", "KTV"],
  ["Energy", "rise then land"],
  ["Safety", "fictional metadata"],
  ["Output", "5-act flow"]
];

const targetLengthOptions = [6, 8, 10, 12];
const languageOptions: Array<{ id: Language; label: string }> = [
  { id: "en", label: "English" },
  { id: "zh", label: "Mandarin" },
  { id: "cantonese", label: "Cantonese" },
  { id: "mixed", label: "Mixed" }
];
const difficultyOptions = [
  { label: "easy", value: 0.55 },
  { label: "medium", value: 0.75 },
  { label: "high", value: 0.9 }
];
const energyCurveMap: Record<ReturnType<typeof useStudioStore.getState>["energyCurve"], TargetEnergyCurve> = {
  "rise-peak-soft": "ramp_up",
  "steady-cruise": "steady",
  "warm-social": "wave"
};

export function SessionPlannerPage() {
  const { plannerPrompt, setPlannerPrompt, energyCurve, setEnergyCurve } =
    useStudioStore();
  const [targetLength, setTargetLength] = useState(8);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([
    "en",
    "zh",
    "cantonese"
  ]);
  const [maxVocalDifficulty, setMaxVocalDifficulty] = useState(0.75);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const sessionsQuery = useQuery({
    queryKey: ["planner", "karaoke-sessions"],
    queryFn: () => getKaraokeSessions({ limit: 5 }),
    retry: false
  });
  const usersQuery = useQuery({
    queryKey: ["planner", "demo-users"],
    queryFn: () => getDemoUsers({ limit: 5 }),
    retry: false
  });
  const generationMutation = useMutation({
    mutationFn: (payload: PlaylistGenerateRequest) => generatePlaylist(payload),
    retry: false
  });
  const sessionsResult = sessionsQuery.data;
  const usersResult = usersQuery.data;
  const selectedApiSession =
    sessionsResult?.ok ? getFirstUsableKaraokeSession(sessionsResult.data.items) : null;
  const selectedDemoUser =
    usersResult?.ok
      ? usersResult.data.items.find((user) => user.id && user.display_name) ?? null
      : null;
  const generationResult = generationMutation.data;
  const generatedPreview =
    generationResult?.ok && isPlaylistGenerateResponseUsable(generationResult.data)
      ? adaptGeneratedPlaylistToPlannerPreview(generationResult.data)
      : null;
  const generationFallback =
    fallbackMessage ||
    (generationResult && !generatedPreview
      ? "Mock playlist generation is unavailable; showing the safe planning preview."
      : null);
  const apiState = resolvePlannerApiState({
    hasSession: Boolean(selectedApiSession),
    hasGeneratedPreview: Boolean(generatedPreview),
    hasFallback: Boolean(generationFallback),
    hasApiAttempt: Boolean(sessionsResult || usersResult || generationResult),
    isLoading: sessionsQuery.isLoading || usersQuery.isLoading || generationMutation.isPending
  });
  const generationBadge = getGenerationBadge({
    isGenerating: generationMutation.isPending,
    hasGeneratedPreview: Boolean(generatedPreview),
    hasFallback: Boolean(generationFallback)
  });
  const GenerationIcon = generationBadge.icon;
  const displayedPreview = generatedPreview ?? getMockPlannerPreview(targetLength);
  const canGenerate = Boolean(selectedApiSession);

  function handleLanguageToggle(language: Language) {
    setSelectedLanguages((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language]
    );
  }

  function handleGenerate() {
    if (generationMutation.isPending) {
      return;
    }

    if (!selectedApiSession) {
      generationMutation.reset();
      setFallbackMessage("Backend session unavailable; using the mock planning preview.");
      return;
    }

    setFallbackMessage(null);
    generationMutation.mutate({
      karaoke_session_id: selectedApiSession.id,
      created_by_user_id: selectedDemoUser?.id ?? null,
      prompt:
        plannerPrompt.trim() ||
        "Build a safe fictional karaoke flow for the selected demo session.",
      target_length: targetLength,
      constraints: {
        languages: selectedLanguages,
        energy_curve: energyCurveMap[energyCurve],
        max_vocal_difficulty: maxVocalDifficulty,
        scene_tags: [selectedApiSession.scene_type]
      },
      mode: "mock"
    });
  }

  return (
    <AppShell
      eyebrow="AI Session Planner"
      title="Shape a karaoke session before any recommendation is generated."
      description="Phase 3A adds a mock-only interactive planning workflow: the local backend can generate a deterministic playlist while the page keeps its safe mock fallback."
      aside={<StateStrip apiState={apiState} apiLabel={getApiStatusLabel(apiState)} />}
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
                Mock-only local backend workflow when available. No real LLM or music platform is connected.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={canGenerate ? "mint" : "amber"}>
                <Sparkles className="h-3 w-3" />
                {canGenerate ? "session ready" : "mock preview"}
              </Badge>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generationMutation.isPending}
                className="inline-flex items-center gap-2 rounded-card border border-accent-cyan/25 bg-accent-cyan/[0.11] px-3 py-2 text-sm font-medium text-[#F7F8FA] transition hover:-translate-y-px hover:border-accent-cyan/45 hover:bg-accent-cyan/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generationMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ListMusic className="h-3.5 w-3.5" />
                )}
                Generate mock playlist
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] border border-white/[0.1] bg-[#080B10]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex flex-wrap gap-2">
                {promptHints.map((hint) => (
                  <Badge key={hint}>{hint}</Badge>
                ))}
              </div>
              <span className="text-xs text-[#8F97A8]">command preview</span>
            </div>
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
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {parserSignals.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-card border border-white/[0.07] bg-white/[0.028] px-3 py-2"
                >
                  <p className="text-[11px] text-[#858C9D]">{label}</p>
                  <p className="mt-1 truncate text-sm font-medium text-[#DDE2EC]">{value}</p>
                </div>
              ))}
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
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-card border border-white/[0.07] bg-white/[0.028] p-3">
                <p className="text-[11px] text-[#858C9D]">target length</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {targetLengthOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTargetLength(option)}
                      className={`rounded-card border px-2.5 py-1.5 text-xs transition hover:border-accent-cyan/35 ${
                        targetLength === option
                          ? "border-accent-mint/35 bg-accent-mint/[0.1] text-[#F7F8FA]"
                          : "border-white/[0.08] bg-black/15 text-[#AEB4C2]"
                      }`}
                    >
                      {option} tracks
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-card border border-white/[0.07] bg-white/[0.028] p-3">
                <p className="text-[11px] text-[#858C9D]">language preference</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {languageOptions.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      onClick={() => handleLanguageToggle(language.id)}
                      className={`rounded-card border px-2.5 py-1.5 text-xs transition hover:border-accent-cyan/35 ${
                        selectedLanguages.includes(language.id)
                          ? "border-accent-cyan/35 bg-accent-cyan/[0.1] text-[#F7F8FA]"
                          : "border-white/[0.08] bg-black/15 text-[#AEB4C2]"
                      }`}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-card border border-white/[0.07] bg-white/[0.028] p-3">
                <p className="text-[11px] text-[#858C9D]">vocal load</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setMaxVocalDifficulty(option.value)}
                      className={`rounded-card border px-2.5 py-1.5 text-xs transition hover:border-accent-cyan/35 ${
                        maxVocalDifficulty === option.value
                          ? "border-accent-violet/35 bg-accent-violet/[0.12] text-[#F7F8FA]"
                          : "border-white/[0.08] bg-black/15 text-[#AEB4C2]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
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
              <Badge variant={generationBadge.variant}>
                <GenerationIcon
                  className={`h-3 w-3 ${generationMutation.isPending ? "animate-spin" : ""}`}
                />
                {generationBadge.label}
              </Badge>
            </div>
            <div className="mt-5 space-y-3">
              {getGenerationSteps({
                isGenerating: generationMutation.isPending,
                hasGeneratedPreview: Boolean(generatedPreview),
                hasFallback: Boolean(generationFallback)
              }).map((item, index) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-3 rounded-card border border-white/[0.08] bg-white/[0.035] p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-card bg-white/[0.06] text-sm text-accent-cyan">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.step}</p>
                      <p className="mt-1 text-xs text-[#8F97A8]">
                        {item.status}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="mt-5 rounded-card border border-white/[0.07] bg-white/[0.026] p-3">
              <div className="flex items-center justify-between text-xs text-[#8F97A8]">
                <span>Mini energy preview</span>
                <span>comfort to peak</span>
              </div>
              <div className="mt-3 grid h-16 grid-cols-8 items-end gap-1.5">
                {[36, 48, 56, 70, 88, 76, 58, 44].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="rounded-t-full bg-gradient-to-t from-accent-cyan/40 to-accent-mint"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Result preview</h2>
                <p className="mt-1 text-xs text-[#8F97A8]">
                  {generatedPreview
                    ? "Backend response adapted into a safe planner preview."
                    : generationFallback ?? "Mock planning preview until generation succeeds."}
                </p>
              </div>
              <Badge variant={generatedPreview ? "mint" : generationFallback ? "amber" : "default"}>
                {generatedPreview ? "generated" : generationFallback ? "fallback" : "preview"}
              </Badge>
            </div>
            <PlannerResultPreview preview={displayedPreview} isGenerated={Boolean(generatedPreview)} />
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

function PlannerResultPreview({
  preview,
  isGenerated
}: {
  preview: GeneratedPlaylistPreviewViewModel;
  isGenerated: boolean;
}) {
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-card border border-white/[0.08] bg-[#0A0D13] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#858C9D]">{preview.workflowLabel}</p>
            <h3 className="mt-1 truncate text-base font-semibold text-[#F7F8FA]">
              {preview.title}
            </h3>
          </div>
          <Badge variant={isGenerated ? "mint" : "default"}>{preview.statusLabel}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {[
            ["scene", preview.sceneLabel],
            ["tracks", preview.trackCountLabel],
            ["target", preview.targetLengthLabel],
            ["Agent", preview.agentRunStatusLabel]
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-white/[0.07] bg-white/[0.035] p-2">
              <p className="text-[11px] text-[#858C9D]">{label}</p>
              <p className="mt-1 truncate text-[#DDE2EC]">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 truncate text-xs text-[#858C9D]">Agent run: {preview.agentRunId}</p>
      </div>

      <div className="space-y-2">
        {preview.tracks.map((track, index) => (
          <div
            key={track.id}
            className="rounded-card border border-white/[0.08] bg-white/[0.03] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] text-[#858C9D]">track {index + 1}</p>
                <p className="mt-1 truncate text-sm font-medium text-[#F7F8FA]">
                  {track.title}
                </p>
                <p className="truncate text-xs text-[#8F97A8]">{track.artist}</p>
              </div>
              <Badge variant="cyan">{track.fitScoreLabel}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#AEB4C2]">
              {track.reason}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href="/timeline"
          className="inline-flex items-center justify-center gap-2 rounded-card border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-[#DDE2EC] transition hover:-translate-y-px hover:border-accent-cyan/35 hover:bg-white/[0.06]"
        >
          Open timeline
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/agent-runs/demo"
          className="inline-flex items-center justify-center gap-2 rounded-card border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-[#DDE2EC] transition hover:-translate-y-px hover:border-accent-violet/35 hover:bg-white/[0.06]"
        >
          Open Agent Console
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function getMockPlannerPreview(targetLength: number): GeneratedPlaylistPreviewViewModel {
  const tracks = playlistPhases
    .flatMap((phase) => phase.songs)
    .slice(0, 5)
    .map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      fitScoreLabel: `${song.fitScore}% fit`,
      reason: song.reason
    }));

  return {
    playlistId: "mock-preview",
    title: "Mock planning preview",
    statusLabel: "Mock data",
    sceneLabel: "KTV",
    trackCountLabel: `${targetLength} target tracks`,
    targetLengthLabel: `${targetLength} selected`,
    agentRunId: "not created",
    agentRunStatusLabel: "mock preview",
    workflowLabel: "Generated by local mock preview",
    tracks
  };
}

function getGenerationBadge({
  isGenerating,
  hasGeneratedPreview,
  hasFallback
}: {
  isGenerating: boolean;
  hasGeneratedPreview: boolean;
  hasFallback: boolean;
}) {
  if (isGenerating) {
    return {
      label: "generating",
      icon: Loader2,
      variant: "cyan" as const
    };
  }

  if (hasGeneratedPreview) {
    return {
      label: "generated",
      icon: CheckCircle2,
      variant: "mint" as const
    };
  }

  if (hasFallback) {
    return {
      label: "fallback",
      icon: Sparkles,
      variant: "amber" as const
    };
  }

  return {
    label: "preview",
    icon: Sparkles,
    variant: "amber" as const
  };
}

function getGenerationSteps({
  isGenerating,
  hasGeneratedPreview,
  hasFallback
}: {
  isGenerating: boolean;
  hasGeneratedPreview: boolean;
  hasFallback: boolean;
}) {
  if (hasGeneratedPreview) {
    return [
      ["Parse scene", "completed"],
      ["Apply constraints", "completed"],
      ["Persist mock playlist", "completed"],
      ["Prepare reasons", "deterministic mock workflow"]
    ].map(([step, status]) => ({ step, status }));
  }

  if (hasFallback) {
    return [
      ["Parse scene", "mock preview"],
      ["Apply constraints", "mock preview"],
      ["Draft phase flow", "fallback active"],
      ["Prepare reasons", "using fictional metadata"]
    ].map(([step, status]) => ({ step, status }));
  }

  if (isGenerating) {
    return [
      ["Parse scene", "sending safe prompt summary"],
      ["Apply constraints", "mode is mock"],
      ["Persist mock playlist", "waiting for local backend"],
      ["Prepare reasons", "pending response"]
    ].map(([step, status]) => ({ step, status }));
  }

  return [
    ["Parse scene", "ready"],
    ["Apply constraints", "ready"],
    ["Draft phase flow", "mock preview"],
    ["Prepare reasons", "mock preview"]
  ].map(([step, status]) => ({ step, status }));
}

function resolvePlannerApiState({
  hasSession,
  hasGeneratedPreview,
  hasFallback,
  hasApiAttempt,
  isLoading
}: {
  hasSession: boolean;
  hasGeneratedPreview: boolean;
  hasFallback: boolean;
  hasApiAttempt: boolean;
  isLoading: boolean;
}): ApiConnectionState {
  if (hasGeneratedPreview || hasSession) {
    return "connected";
  }

  if (!isLoading && (hasFallback || hasApiAttempt)) {
    return "fallback";
  }

  return "mock";
}

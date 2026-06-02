"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioWaveform,
  Bot,
  Car,
  Command,
  Disc3,
  Home,
  Layers3,
  Mic2,
  Play,
  Search,
  Sparkles,
  Timer
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SongCard } from "@/components/playlist/song-card";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import { CoverArt } from "@/components/visual/cover-art";
import { EnergyField } from "@/components/visual/energy-field";
import { agentSteps, featuredSongs, sceneEntrypoints } from "@/lib/mock-data";
import { useStudioStore } from "@/lib/studio-store";
import { cn } from "@/lib/utils";

const sceneIcons = {
  ktv: Mic2,
  car: Car,
  home_party: Home
};

const studioStats = [
  { label: "Phase flow", value: "5 acts", icon: Layers3 },
  { label: "Session length", value: "90 min", icon: Timer },
  { label: "Safe catalog", value: "fictional", icon: Disc3 }
];

const parsedSignals = ["KTV scene", "6 singers", "mixed languages", "rise-peak-soft"];

const workflowMap = ["Prompt", "Taste", "Rank", "Explain"];

export function StudioHome() {
  const { selectedScene, setSelectedScene, plannerPrompt, setPlannerPrompt } =
    useStudioStore();
  const selected = sceneEntrypoints.find((scene) => scene.id === selectedScene);

  return (
    <AppShell
      eyebrow="Studio Home"
      title="AI Native Karaoke & Music Workflow Studio"
      description="Compose a scene, preview a traceable playlist flow, and inspect the mock Agent workflow without connecting to real APIs."
      aside={<StateStrip />}
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative min-h-[650px] overflow-hidden rounded-[24px] border border-white/[0.11] bg-[linear-gradient(135deg,#10141D_0%,#090B10_58%,#050609_100%)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] sm:p-7"
        >
          <EnergyField />
          <div className="relative z-10 grid min-h-[590px] gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan">
                  <Sparkles className="h-3 w-3" />
                  Studio workflow
                </Badge>
                <Badge>mock metadata only</Badge>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm font-medium text-accent-mint">
                  Scene prompt to music flow
                </p>
                <h2 className="mt-4 text-[42px] font-semibold leading-[1.03] tracking-normal md:text-[68px]">
                  Orchestrate the room before the first song starts.
                </h2>
                <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#B8BECC]">
                  SingFlow AI treats karaoke as a workflow: prompt, constraints,
                  group taste, playlist phases, reasons, and Agent trace in one
                  studio surface.
                </p>
              </div>

              <div className="rounded-[16px] border border-white/[0.12] bg-[#080B10]/72 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                <div className="flex items-start gap-3 rounded-card border border-white/[0.1] bg-white/[0.055] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-accent-cyan/20 bg-accent-cyan/[0.08] text-accent-cyan">
                    <Command className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#8F97A8]">
                      <Search className="h-3.5 w-3.5" />
                      AI Studio command surface
                    </div>
                    <textarea
                      value={plannerPrompt}
                      onChange={(event) => setPlannerPrompt(event.target.value)}
                      aria-label="Scene prompt composer"
                      rows={3}
                      className="min-h-16 w-full resize-none bg-transparent text-[15px] leading-7 text-[#F7F8FA] outline-none placeholder:text-muted"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3">
                      <span className="text-xs text-[#8F97A8]">Parsed signals</span>
                      {parsedSignals.map((signal) => (
                        <Badge key={signal}>{signal}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="mint">{selected?.label}</Badge>
                    <Badge>group fusion</Badge>
                    <Badge>visible Agent run</Badge>
                  </div>
                  <Link
                    href="/planner"
                    className="inline-flex items-center gap-2 rounded-card bg-accent-mint px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent-cyan"
                  >
                    <Play className="h-4 w-4" />
                    Plan session
                  </Link>
                </div>
              </div>
            </div>

            <aside className="hidden min-h-full flex-col justify-between rounded-[20px] border border-white/[0.1] bg-black/24 p-4 backdrop-blur-md xl:flex">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="violet">Live arrangement</Badge>
                  <AudioWaveform className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="mt-4 rounded-card border border-white/[0.08] bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between text-xs text-[#8F97A8]">
                    <span>Workflow map</span>
                    <span>mock trace</span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {workflowMap.map((item, index) => (
                      <div key={item} className="min-w-0">
                        <div
                          className={cn(
                            "h-1 rounded-full",
                            index < 2 ? "bg-accent-mint" : index === 2 ? "bg-accent-cyan" : "bg-accent-violet"
                          )}
                        />
                        <p className="mt-2 truncate text-[11px] text-[#C9D0DD]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {featuredSongs.slice(0, 4).map((song, index) => (
                    <div
                      key={song.id}
                      className={cn("transition", index % 2 === 1 && "translate-y-6")}
                    >
                      <CoverArt song={song} size="lg" className="h-[148px] w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 space-y-3">
                {studioStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-card border border-white/[0.08] bg-white/[0.035] px-3 py-2.5"
                    >
                      <span className="flex items-center gap-2 text-sm text-[#C9D0DD]">
                        <Icon className="h-4 w-4 text-accent-cyan" />
                        {stat.label}
                      </span>
                      <span className="text-sm font-medium">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </motion.div>

        <div className="grid gap-5">
          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Scene entries</h2>
                <p className="mt-1 text-sm text-[#9EA6B7]">
                  Start from the room, not from a blank chat.
                </p>
              </div>
              <Badge variant="cyan">3 scenes</Badge>
            </div>
            <div className="mt-4 grid gap-3">
              {sceneEntrypoints.map((scene) => {
                const Icon = sceneIcons[scene.id];
                const active = selectedScene === scene.id;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setSelectedScene(scene.id)}
                    className={cn(
                      "group rounded-card border p-4 text-left transition hover:-translate-y-px hover:border-accent-cyan/28 hover:bg-white/[0.055]",
                      active
                        ? "border-accent-mint/30 bg-[linear-gradient(90deg,rgba(47,230,166,0.12),rgba(255,255,255,0.035))]"
                        : "border-white/[0.08] bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-card border border-white/[0.08] bg-black/20">
                        <Icon className="h-4 w-4 text-accent-cyan" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{scene.label}</span>
                          <ArrowRight className="h-4 w-4 text-[#737B8D] transition group-hover:translate-x-0.5 group-hover:text-accent-cyan" />
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[#AEB4C2]">
                          {scene.description}
                        </span>
                        <span className="mt-3 block text-xs text-[#7F8899]">
                          {scene.intensity}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-panel border border-white/[0.08] bg-[#0D1017]/88 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Agent arranging</h2>
              <Badge variant="violet">mock run</Badge>
            </div>
            <div className="mt-4 space-y-2.5">
              {agentSteps.slice(0, 5).map((step, index) => (
                <div
                  key={step.id}
                  className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 rounded-card border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-accent-violet/28 hover:bg-white/[0.05]"
                >
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 text-xs text-accent-cyan">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{step.tool}</p>
                    <p className="mt-1 max-h-10 overflow-hidden text-xs leading-5 text-[#AEB4C2]">
                      {step.outputSummary}
                    </p>
                  </div>
                  <span className="text-xs text-[#8C94A5]">{step.latencyMs} ms</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-card border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-[#8F97A8]">
              No chain-of-thought, only safe tool summaries and workflow status.
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-panel border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Playlist content stream</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                Fictional songs with original abstract cover blocks and visible reasons.
              </p>
            </div>
            <Link
              href="/timeline"
              className="inline-flex items-center gap-2 rounded-card border border-white/[0.1] bg-white/[0.045] px-3 py-2 text-sm text-[#D9DDE7] transition hover:border-accent-cyan/30 hover:text-foreground"
            >
              Open timeline
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {featuredSongs.slice(0, 6).map((song, index) => (
              <div key={song.id} className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs text-[#7F8899]">
                  <span>Act {String(index + 1).padStart(2, "0")}</span>
                  <span>{song.sceneTags.slice(0, 2).join(" / ")}</span>
                </div>
                <SongCard song={song} compact />
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <LoadingState label="Ranking fictional candidates by scene fit." />
          <EmptyState
            title="Safe empty library"
            description="If no fictional metadata matches, the Studio asks for broader language, energy, or difficulty constraints."
          />
        </div>
      </section>
    </AppShell>
  );
}

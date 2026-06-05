"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3, Gauge, ListMusic, Route, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SongCard } from "@/components/playlist/song-card";
import { EmptyState, LoadingState, StateStrip } from "@/components/states/state-strip";
import { Badge } from "@/components/ui/badge";
import {
  adaptKaraokeSessionToTimelineSummary,
  adaptSessionMembersToCompactView,
  getApiStatusLabel,
  getFirstUsableKaraokeSession,
  getKaraokeSession,
  getKaraokeSessionMembers,
  getKaraokeSessions,
  isKaraokeSessionDetailUsable,
  isKaraokeSessionsUsable,
  isSessionMembersUsable
} from "@/lib/api";
import type {
  ApiConnectionState,
  ApiResult,
  KaraokeSessionApiItem,
  KaraokeSessionDetailApiResponse,
  KaraokeSessionMemberApiItem,
  ListResponse,
  PaginatedResponse,
  TimelineSessionSummaryViewModel
} from "@/lib/api";
import { playlistPhases } from "@/lib/mock-data";

const phaseAccents = [
  "from-accent-cyan to-accent-mint",
  "from-accent-mint to-accent-amber",
  "from-accent-coral to-accent-amber",
  "from-accent-violet to-accent-cyan",
  "from-accent-mint to-accent-cyan"
];

const phaseEnergy = [46, 64, 90, 56, 76];

export function TimelinePage() {
  const totalSongs = playlistPhases.reduce((total, phase) => total + phase.songs.length, 0);
  const sessionsQuery = useQuery({
    queryKey: ["timeline", "karaoke-sessions"],
    queryFn: () => getKaraokeSessions({ limit: 5 }),
    retry: false
  });
  const sessionsResult = sessionsQuery.data;
  const apiSessions =
    sessionsResult?.ok && isKaraokeSessionsUsable(sessionsResult.data.items)
      ? sessionsResult.data.items
      : null;
  const selectedApiSession = getFirstUsableKaraokeSession(apiSessions);
  const selectedSessionId = selectedApiSession?.id;
  const detailQuery = useQuery({
    queryKey: ["timeline", "karaoke-session", selectedSessionId],
    queryFn: () => getKaraokeSession(selectedSessionId ?? ""),
    enabled: Boolean(selectedSessionId),
    retry: false
  });
  const membersQuery = useQuery({
    queryKey: ["timeline", "karaoke-session-members", selectedSessionId],
    queryFn: () => getKaraokeSessionMembers(selectedSessionId ?? ""),
    enabled: Boolean(selectedSessionId),
    retry: false
  });
  const detailResult = detailQuery.data;
  const membersResult = membersQuery.data;
  const apiDetail = detailResult?.ok ? detailResult.data : null;
  const apiMembers = membersResult?.ok ? membersResult.data.items : null;
  const hasApiSession = isKaraokeSessionDetailUsable(selectedApiSession, apiDetail);
  const hasApiMembers = isSessionMembersUsable(apiMembers);
  const isApiConnected = Boolean(
    selectedApiSession && apiDetail && apiMembers && hasApiSession && hasApiMembers
  );
  const apiState = resolveTimelineApiState({
    sessionsResult,
    detailResult,
    membersResult,
    hasApiData: isApiConnected,
    isLoading: sessionsQuery.isLoading || detailQuery.isLoading || membersQuery.isLoading
  });
  const displayedSession =
    isApiConnected && selectedApiSession && apiDetail
      ? adaptKaraokeSessionToTimelineSummary(selectedApiSession, apiDetail)
      : getMockTimelineSummary();
  const displayedMembers =
    isApiConnected && apiMembers ? adaptSessionMembersToCompactView(apiMembers) : [];
  const inspectorStats = getInspectorStats({
    totalSongs,
    displayedSession,
    isApiConnected
  });

  return (
    <AppShell
      eyebrow="Playlist Timeline"
      title="A full KTV session, arranged as an energy-aware workflow."
      description="Phase 2H-4 reads backend session metadata and members when available; phase cards and fictional song placement remain mock."
      aside={<StateStrip apiState={apiState} apiLabel={getApiStatusLabel(apiState)} />}
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-panel border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.024))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{displayedSession.title}</h2>
              <p className="mt-1 text-sm text-[#9EA6B7]">
                {isApiConnected
                  ? `${displayedSession.sceneLabel} metadata from backend; Warmup, Build-up, Peak, Nostalgic, and Finale remain mock timeline phases.`
                  : "Warmup, Build-up, Peak, Nostalgic, and Finale with visible energy placement."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="mint">
                <Clock3 className="h-3 w-3" />
                {displayedSession.durationLabel}
              </Badge>
              {isApiConnected && <Badge>{displayedSession.statusLabel}</Badge>}
              <Badge variant="cyan">
                <Sparkles className="h-3 w-3" />
                original reasons
              </Badge>
            </div>
          </div>

          <div className="mt-6 rounded-panel border border-white/[0.08] bg-[#080B10]/70 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#DDE2EC]">Energy curve</span>
              <span className="text-[#858C9D]">comfort to peak to soft landing</span>
            </div>
            <div className="mt-4 grid h-28 grid-cols-5 items-end gap-2">
              {playlistPhases.map((phase, index) => (
                <div key={phase.id} className="flex h-full flex-col justify-end gap-2">
                  <div
                    className={`rounded-t-card bg-gradient-to-t ${phaseAccents[index]} opacity-85 shadow-[0_0_24px_rgba(102,217,239,0.14)]`}
                    style={{ height: `${phaseEnergy[index]}%` }}
                  />
                  <span className="truncate text-center text-[11px] text-[#8F97A8]">
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {playlistPhases.map((phase, index) => (
              <section
                key={phase.id}
                className="relative overflow-hidden rounded-panel border border-white/[0.08] bg-[#0A0D13] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${phaseAccents[index]}`}
                />
                <div className="absolute right-5 top-5 hidden h-16 w-28 items-end gap-1 opacity-40 md:flex">
                  {[30, 58, 42, 82, 64, 48, 74, 38].map((height, barIndex) => (
                    <span
                      key={`${phase.id}-${height}-${barIndex}`}
                      className={`flex-1 rounded-full bg-gradient-to-t ${phaseAccents[index]}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4 pl-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-white/[0.1] bg-white/[0.05] text-sm font-semibold text-accent-cyan">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{phase.name}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#AEB4C2]">
                        {phase.intent}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{phase.duration}</Badge>
                    <Badge variant="violet">energy {phase.energyLabel}</Badge>
                    <Badge variant={phase.songs.length > 1 ? "cyan" : "mint"}>
                      {phase.songs.length} songs
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {phase.songs.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="grid content-start gap-4 xl:sticky xl:top-8">
          <section className="rounded-panel border border-white/[0.08] bg-[#0D1017]/90 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Session inspector</h2>
              <Route className="h-5 w-5 text-accent-cyan" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {inspectorStats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-card border border-white/[0.08] bg-white/[0.035] p-3"
                >
                  <dt className="text-[11px] text-[#858C9D]">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-[#DDE2EC]">{value}</dd>
                </div>
              ))}
            </div>
            {isApiConnected && (
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <p className="text-xs text-[#858C9D]">Backend session metadata</p>
                <div className="mt-3 grid gap-2 text-sm">
                  {[
                    ["feedback", displayedSession.feedbackLabel],
                    ["latest playlist", displayedSession.latestPlaylistLabel],
                    ["latest Agent run", displayedSession.latestAgentRunLabel],
                    ["updated", displayedSession.updatedLabel]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-[#858C9D]">{label}</span>
                      <span className="min-w-0 truncate text-right text-[#C9D0DD]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {displayedMembers.length > 0 && (
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <p className="text-xs text-[#858C9D]">Members from API</p>
                <div className="mt-3 space-y-2">
                  {displayedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-card border border-white/[0.08] bg-white/[0.035] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium text-[#DDE2EC]">
                          {member.name}
                        </span>
                        <Badge>{member.weightLabel}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#858C9D]">{member.role}</p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#AEB4C2]">
                        {member.profileLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <p className="text-xs text-[#858C9D]">Phase path</p>
              <div className="mt-3 space-y-2">
                {playlistPhases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`h-2 w-2 rounded-full bg-gradient-to-r ${phaseAccents[index]}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[#C9D0DD]">{phase.name}</span>
                    <span className="text-xs text-[#858C9D]">{phase.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-accent-mint" />
              Fit logic preview
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Vocal load", "Easy tracks open the room before the peak."],
                ["Language mix", "English, Mandarin, Cantonese, and mixed songs rotate."],
                ["Energy placement", "The highest load is centered in the peak phase."]
              ].map(([title, text]) => (
                <div key={title} className="border-l border-white/[0.12] pl-3">
                  <p className="text-sm font-medium text-[#F7F8FA]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#AEB4C2]">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <LoadingState
            label={
              apiState === "connected"
                ? "Reading backend session metadata."
                : "Arranging mock phase order and fit scores."
            }
          />
          <EmptyState
            title="Empty timeline state"
            description="If no safe fictional songs are available, the phase scaffold remains visible and asks for seed metadata."
          />
          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent-mint" />
              Copyright-safe fields
            </div>
            <p className="mt-3 text-sm leading-6 text-[#AEB4C2]">
              Cards show metadata and original recommendation reasons only: no
              lyrics, audio, MV, real covers, or copied brand assets.
            </p>
          </section>
          <section className="rounded-panel border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ListMusic className="h-4 w-4 text-accent-cyan" />
              Timeline fields
            </div>
            <p className="mt-3 text-sm leading-6 text-[#AEB4C2]">
              Title, fictional artist, language, mood, energy, vocal difficulty,
              fit score, and reason stay visible for screenshot review.
            </p>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

function getMockTimelineSummary(): TimelineSessionSummaryViewModel {
  return {
    id: "mock-session-timeline",
    title: "Demo session timeline",
    sceneLabel: "Mock KTV",
    statusLabel: "Mock data",
    durationLabel: "90 min",
    membersLabel: "mock members",
    playlistsLabel: "mock playlist",
    feedbackLabel: "mock feedback",
    latestPlaylistLabel: "none",
    latestAgentRunLabel: "none",
    updatedLabel: "n/a"
  };
}

function getInspectorStats({
  totalSongs,
  displayedSession,
  isApiConnected
}: {
  totalSongs: number;
  displayedSession: TimelineSessionSummaryViewModel;
  isApiConnected: boolean;
}) {
  if (isApiConnected) {
    return [
      ["scene", displayedSession.sceneLabel],
      ["status", displayedSession.statusLabel],
      ["members", displayedSession.membersLabel],
      ["playlists", displayedSession.playlistsLabel]
    ];
  }

  return [
    ["songs", `${totalSongs} fictional`],
    ["languages", "4 modes"],
    ["phases", `${playlistPhases.length} acts`],
    ["rights", "metadata only"]
  ];
}

function resolveTimelineApiState({
  sessionsResult,
  detailResult,
  membersResult,
  hasApiData,
  isLoading
}: {
  sessionsResult: ApiResult<PaginatedResponse<KaraokeSessionApiItem>> | undefined;
  detailResult: ApiResult<KaraokeSessionDetailApiResponse> | undefined;
  membersResult: ApiResult<ListResponse<KaraokeSessionMemberApiItem>> | undefined;
  hasApiData: boolean;
  isLoading: boolean;
}): ApiConnectionState {
  if (hasApiData) {
    return "connected";
  }

  if (!isLoading && (sessionsResult || detailResult || membersResult)) {
    return "fallback";
  }

  return "mock";
}

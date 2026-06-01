export type SceneId = "ktv" | "car" | "home_party";

export type SongLanguage = "en" | "zh" | "cantonese" | "mixed";

export type MockSong = {
  id: string;
  title: string;
  artist: string;
  language: SongLanguage;
  mood: string;
  energy: number;
  vocalDifficulty: number;
  fitScore: number;
  sceneTags: string[];
  reason: string;
  coverTone: "cyan" | "mint" | "amber" | "coral" | "violet";
};

export type PlaylistPhase = {
  id: string;
  name: string;
  intent: string;
  duration: string;
  energyLabel: string;
  songs: MockSong[];
};

export type DemoMember = {
  id: string;
  name: string;
  role: string;
  weight: number;
  languages: SongLanguage[];
  difficulty: "Easy" | "Medium" | "High";
  tags: string[];
  energyBias: number;
};

export type AgentStepStatus = "completed" | "running" | "queued" | "warning";

export type AgentStep = {
  id: string;
  tool: string;
  status: AgentStepStatus;
  latencyMs: number;
  inputSummary: string;
  outputSummary: string;
};

export const sceneEntrypoints: Array<{
  id: SceneId;
  label: string;
  description: string;
  prompt: string;
  intensity: string;
}> = [
  {
    id: "ktv",
    label: "KTV Room",
    description: "Group rotation, chorus peaks, confident finale.",
    prompt:
      "Plan a 90-minute KTV night for five friends with Mandarin, Cantonese, and English hooks.",
    intensity: "Social peak"
  },
  {
    id: "car",
    label: "Car Ride",
    description: "Hands-free flow, steady energy, no fragile transitions.",
    prompt:
      "Build a late-evening car playlist with calm start, highway lift, and soft arrival.",
    intensity: "Cruise lift"
  },
  {
    id: "home_party",
    label: "Home Party",
    description: "Warmup-friendly, compact turns, low-friction chorus moments.",
    prompt:
      "Create a home party singing flow for mixed confidence levels and bilingual guests.",
    intensity: "Warm social"
  }
];

export const plannerConstraints = [
  "6 singers",
  "90 minutes",
  "zh / en / cantonese",
  "medium vocal load",
  "rise-peak-soft landing",
  "chorus friendly"
];

export const playlistPhases: PlaylistPhase[] = [
  {
    id: "warmup",
    name: "Warmup",
    intent: "Open with easy range, familiar rhythm, and low-pressure group entry.",
    duration: "0-18 min",
    energyLabel: "40 -> 58",
    songs: [
      {
        id: "song-neon-harbor",
        title: "Neon Harbor",
        artist: "Mira Vale",
        language: "en",
        mood: "bright",
        energy: 54,
        vocalDifficulty: 32,
        fitScore: 91,
        sceneTags: ["ktv", "warmup", "home_party"],
        reason:
          "Gentle range and clean chorus shape make it a safe first rotation for mixed confidence.",
        coverTone: "cyan"
      },
      {
        id: "song-silver-rain-lane",
        title: "Silver Rain Lane",
        artist: "Luna Qiao",
        language: "zh",
        mood: "soft glow",
        energy: 49,
        vocalDifficulty: 38,
        fitScore: 88,
        sceneTags: ["warmup", "late_night"],
        reason:
          "Keeps the room relaxed while introducing a bilingual-friendly melodic contour.",
        coverTone: "mint"
      }
    ]
  },
  {
    id: "build-up",
    name: "Build-up",
    intent: "Increase confidence with duet-ready structures and stronger hooks.",
    duration: "18-42 min",
    energyLabel: "58 -> 76",
    songs: [
      {
        id: "song-glass-skyline",
        title: "Glass Skyline",
        artist: "North Arcade",
        language: "mixed",
        mood: "sleek",
        energy: 68,
        vocalDifficulty: 44,
        fitScore: 93,
        sceneTags: ["ktv", "car", "chorus"],
        reason:
          "Alternating language sections support shared turns without demanding a power vocal.",
        coverTone: "violet"
      },
      {
        id: "song-ember-route",
        title: "Ember Route",
        artist: "Kai Sterling",
        language: "en",
        mood: "forward",
        energy: 72,
        vocalDifficulty: 51,
        fitScore: 86,
        sceneTags: ["car", "high_energy"],
        reason:
          "A steady rhythmic lift bridges the room from warm conversation into active singing.",
        coverTone: "amber"
      }
    ]
  },
  {
    id: "peak",
    name: "Peak",
    intent: "Put the strongest voices and highest group energy in the center.",
    duration: "42-68 min",
    energyLabel: "76 -> 92",
    songs: [
      {
        id: "song-signal-bloom",
        title: "Signal Bloom",
        artist: "Ari Chen",
        language: "cantonese",
        mood: "electric",
        energy: 90,
        vocalDifficulty: 73,
        fitScore: 89,
        sceneTags: ["ktv", "high_energy", "chorus"],
        reason:
          "Best placed after the room is warmed up because its chorus rewards confident voices.",
        coverTone: "coral"
      },
      {
        id: "song-afterlight-drive",
        title: "Afterlight Drive",
        artist: "The Fictional Hours",
        language: "mixed",
        mood: "wide screen",
        energy: 84,
        vocalDifficulty: 61,
        fitScore: 92,
        sceneTags: ["car", "home_party", "high_energy"],
        reason:
          "High energy with clear handoff points helps several singers share the spotlight.",
        coverTone: "cyan"
      }
    ]
  },
  {
    id: "nostalgic",
    name: "Nostalgic",
    intent: "Lower intensity without losing emotional focus.",
    duration: "68-82 min",
    energyLabel: "72 -> 55",
    songs: [
      {
        id: "song-moonlit-circuit",
        title: "Moonlit Circuit",
        artist: "Evan Lin",
        language: "zh",
        mood: "nostalgic",
        energy: 57,
        vocalDifficulty: 48,
        fitScore: 90,
        sceneTags: ["nostalgic", "late_night"],
        reason:
          "A softer contour creates a shared breather after the peak while staying emotionally present.",
        coverTone: "mint"
      },
      {
        id: "song-old-town-satellite",
        title: "Old Town Satellite",
        artist: "June Harbor",
        language: "cantonese",
        mood: "warm memory",
        energy: 52,
        vocalDifficulty: 42,
        fitScore: 84,
        sceneTags: ["ktv", "nostalgic"],
        reason:
          "Balances Cantonese preference with a calmer late-session vocal load.",
        coverTone: "amber"
      }
    ]
  },
  {
    id: "finale",
    name: "Finale",
    intent: "Close with shared chorus energy and a clean landing.",
    duration: "82-90 min",
    energyLabel: "62 -> 78",
    songs: [
      {
        id: "song-city-on-repeat",
        title: "City on Repeat",
        artist: "Nova Park",
        language: "en",
        mood: "uplifting",
        energy: 76,
        vocalDifficulty: 46,
        fitScore: 94,
        sceneTags: ["finale", "chorus", "home_party"],
        reason:
          "A wide chorus and moderate range make it an inclusive closer for the whole group.",
        coverTone: "violet"
      }
    ]
  }
];

export const featuredSongs = playlistPhases.flatMap((phase) => phase.songs);

export const demoMembers: DemoMember[] = [
  {
    id: "member-mina",
    name: "Mina",
    role: "chorus anchor",
    weight: 0.32,
    languages: ["zh", "mixed"],
    difficulty: "Medium",
    tags: ["nostalgic", "chorus", "warmup"],
    energyBias: 62
  },
  {
    id: "member-jay",
    name: "Jay",
    role: "energy driver",
    weight: 0.28,
    languages: ["en", "mixed"],
    difficulty: "High",
    tags: ["high_energy", "car", "peak"],
    energyBias: 84
  },
  {
    id: "member-rui",
    name: "Rui",
    role: "Cantonese lane",
    weight: 0.24,
    languages: ["cantonese", "zh"],
    difficulty: "Medium",
    tags: ["nostalgic", "ktv", "late_night"],
    energyBias: 58
  },
  {
    id: "member-ava",
    name: "Ava",
    role: "low-pressure guest",
    weight: 0.16,
    languages: ["en"],
    difficulty: "Easy",
    tags: ["warmup", "home_party", "chorus"],
    energyBias: 48
  }
];

export const fusionRadarData = [
  { axis: "Energy", group: 78, comfort: 66 },
  { axis: "Chorus", group: 86, comfort: 72 },
  { axis: "Nostalgia", group: 64, comfort: 78 },
  { axis: "Language Mix", group: 82, comfort: 70 },
  { axis: "Vocal Ease", group: 69, comfort: 88 },
  { axis: "Pace", group: 74, comfort: 68 }
];

export const groupCompromises = [
  {
    conflict: "High-energy English picks vs. softer Cantonese nostalgia",
    compromise: "Place bilingual high-energy tracks before nostalgic Cantonese cooldown."
  },
  {
    conflict: "Two confident singers prefer harder peaks",
    compromise: "Assign difficult tracks to the middle peak after two warmup rotations."
  },
  {
    conflict: "A guest prefers easy English choruses",
    compromise: "Use inclusive finale and shorter guest turns instead of excluding harder songs."
  }
];

export const agentRun = {
  id: "agent-run-demo-001",
  mode: "Phase 1 mock preview",
  objective: "Build a 90-minute KTV workflow for five singers.",
  status: "completed",
  startedAt: "20:14",
  totalLatencyMs: 4860
};

export const agentSteps: AgentStep[] = [
  {
    id: "step-parse",
    tool: "parse_scene_prompt",
    status: "completed",
    latencyMs: 320,
    inputSummary: "90-minute KTV prompt with mixed language request.",
    outputSummary: "Detected KTV scene, five singers, rising energy curve, mixed-language scope."
  },
  {
    id: "step-search",
    tool: "search_song_catalog",
    status: "completed",
    latencyMs: 740,
    inputSummary: "Scene tags, language mix, energy curve, vocal comfort limits.",
    outputSummary: "Returned 42 fictional metadata candidates with no media assets."
  },
  {
    id: "step-taste",
    tool: "fetch_taste_profiles",
    status: "completed",
    latencyMs: 510,
    inputSummary: "Demo group member ids and mock session context.",
    outputSummary: "Loaded four demo taste profiles and preference weights."
  },
  {
    id: "step-fuse",
    tool: "fuse_group_preferences",
    status: "completed",
    latencyMs: 890,
    inputSummary: "Member weights, language preferences, difficulty comfort.",
    outputSummary: "Generated explainable group profile with three compromise notes."
  },
  {
    id: "step-rank",
    tool: "rank_song_candidates",
    status: "completed",
    latencyMs: 980,
    inputSummary: "Candidate songs, group profile, phase constraints.",
    outputSummary: "Ranked candidates by fit score, energy placement, and vocal load."
  },
  {
    id: "step-build",
    tool: "build_playlist",
    status: "running",
    latencyMs: 860,
    inputSummary: "Ranked songs and target phase structure.",
    outputSummary: "Drafted Warmup, Build-up, Peak, Nostalgic, and Finale flow."
  },
  {
    id: "step-reasons",
    tool: "generate_reasons",
    status: "queued",
    latencyMs: 0,
    inputSummary: "Playlist items and group preference summary.",
    outputSummary: "Waiting to generate concise original recommendation reasons."
  }
];

export const dashboardMetrics = [
  { label: "Mock sessions", value: "24", delta: "+18%" },
  { label: "Accepted songs", value: "186", delta: "+31%" },
  { label: "Avg fit score", value: "91", delta: "+4 pts" },
  { label: "Agent success", value: "96%", delta: "+2%" }
];

export const feedbackDistribution = [
  { name: "Loved", value: 46 },
  { name: "Saved", value: 28 },
  { name: "Skipped", value: 14 },
  { name: "Too hard", value: 12 }
];

export const tasteEvolution = [
  { week: "W1", chorus: 58, nostalgic: 42, highEnergy: 62 },
  { week: "W2", chorus: 64, nostalgic: 48, highEnergy: 68 },
  { week: "W3", chorus: 72, nostalgic: 51, highEnergy: 75 },
  { week: "W4", chorus: 78, nostalgic: 59, highEnergy: 73 },
  { week: "W5", chorus: 82, nostalgic: 66, highEnergy: 79 }
];

export const agentPerformance = [
  { tool: "parse", latency: 320, success: 99 },
  { tool: "search", latency: 740, success: 96 },
  { tool: "taste", latency: 510, success: 98 },
  { tool: "fuse", latency: 890, success: 94 },
  { tool: "rank", latency: 980, success: 95 },
  { tool: "build", latency: 860, success: 97 }
];

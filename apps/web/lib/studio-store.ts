"use client";

import { create } from "zustand";

import type { SceneId } from "./mock-data";

type StudioState = {
  selectedScene: SceneId;
  energyCurve: "rise-peak-soft" | "steady-cruise" | "warm-social";
  plannerPrompt: string;
  setSelectedScene: (scene: SceneId) => void;
  setEnergyCurve: (curve: StudioState["energyCurve"]) => void;
  setPlannerPrompt: (prompt: string) => void;
};

export const useStudioStore = create<StudioState>((set) => ({
  selectedScene: "ktv",
  energyCurve: "rise-peak-soft",
  plannerPrompt:
    "Plan a 90-minute KTV night for five friends with Mandarin, Cantonese, and English hooks.",
  setSelectedScene: (selectedScene) => set({ selectedScene }),
  setEnergyCurve: (energyCurve) => set({ energyCurve }),
  setPlannerPrompt: (plannerPrompt) => set({ plannerPrompt })
}));

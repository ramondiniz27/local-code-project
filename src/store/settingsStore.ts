import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OllamaModel } from "../lib/ollama";

const LEGACY_URL_KEY = "ollamaUrl";

interface SettingsState {
  ollamaUrl: string | null;
  lastKnownModels: OllamaModel[];
  modelPreferences: Record<string, boolean>;
  setOllamaUrl: (url: string) => void;
  setLastKnownModels: (models: OllamaModel[]) => void;
  setModelEnabled: (name: string, enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ollamaUrl: localStorage.getItem(LEGACY_URL_KEY),
      lastKnownModels: [],
      modelPreferences: {},
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setLastKnownModels: (models) => set({ lastKnownModels: models }),
      setModelEnabled: (name, enabled) =>
        set((state) => ({
          modelPreferences: { ...state.modelPreferences, [name]: enabled },
        })),
    }),
    { name: "oc.settings" },
  ),
);

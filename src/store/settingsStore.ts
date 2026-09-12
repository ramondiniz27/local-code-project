import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OllamaModel } from "../lib/ollama";

const URL_KEY = "ollamaUrl";
export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

interface SettingsState {
  ollamaUrl: string;
  lastKnownModels: OllamaModel[];
  modelPreferences: Record<string, boolean>;
  setOllamaUrl: (url: string) => void;
  setLastKnownModels: (models: OllamaModel[]) => void;
  setModelEnabled: (name: string, enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ollamaUrl: localStorage.getItem(URL_KEY) || DEFAULT_OLLAMA_URL,
      lastKnownModels: [],
      modelPreferences: {},
      setOllamaUrl: (url) => {
        const trimmed = url.trim() || DEFAULT_OLLAMA_URL;
        localStorage.setItem(URL_KEY, trimmed);
        set({ ollamaUrl: trimmed });
      },
      setLastKnownModels: (models) => set({ lastKnownModels: models }),
      setModelEnabled: (name, enabled) =>
        set((state) => ({
          modelPreferences: { ...state.modelPreferences, [name]: enabled },
        })),
    }),
    { name: "oc.settings" },
  ),
);

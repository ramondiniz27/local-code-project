import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OllamaModel } from "../lib/ollama";

const URL_KEY = "ollamaUrl";
export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

interface SettingsState {
  ollamaUrl: string;
  lastKnownModels: OllamaModel[];
  modelPreferences: Record<string, boolean>;
  isSettingsOpen: boolean;
  setOllamaUrl: (url: string) => void;
  setLastKnownModels: (models: OllamaModel[]) => void;
  setModelEnabled: (name: string, enabled: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ollamaUrl: localStorage.getItem(URL_KEY) || "",
      lastKnownModels: [],
      modelPreferences: {},
      isSettingsOpen: false,
      setOllamaUrl: (url) => {
        const trimmed = url.trim();
        if (trimmed) {
          localStorage.setItem(URL_KEY, trimmed);
        } else {
          localStorage.removeItem(URL_KEY);
        }
        set({ ollamaUrl: trimmed });
      },
      setLastKnownModels: (models) => set({ lastKnownModels: models }),
      setModelEnabled: (name, enabled) =>
        set((state) => ({
          modelPreferences: { ...state.modelPreferences, [name]: enabled },
        })),
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    { name: "oc.settings" },
  ),
);

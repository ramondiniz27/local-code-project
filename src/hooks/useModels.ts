import { useCallback, useEffect, useState } from "react";
import { listModels, selectModel, type OllamaModel } from "../lib/ollama";
import { useSettingsStore } from "../store/settingsStore";

export function useModels(pollIntervalMs = 5000) {
  const ollamaUrl = useSettingsStore((s) => s.ollamaUrl);
  const lastKnownModels = useSettingsStore((s) => s.lastKnownModels);
  const setLastKnownModels = useSettingsStore((s) => s.setLastKnownModels);
  const modelPreferences = useSettingsStore((s) => s.modelPreferences);

  const [models, setModels] = useState<OllamaModel[]>(() => lastKnownModels);
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    const visible = lastKnownModels.filter(
      (m) => modelPreferences[m.name] ?? true,
    );
    return visible[0]?.name ?? "";
  });
  const [isConnected, setIsConnected] = useState<boolean>(lastKnownModels.length > 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModels = useCallback(async () => {
    if (!ollamaUrl) return;
    setIsLoading(true);
    try {
      const list = await listModels(ollamaUrl);
      const visible = list.filter(
        (model) => modelPreferences[model.name] ?? true,
      );
      setModels(visible);
      setLastKnownModels(list);
      setIsConnected(visible.length > 0);
      setError(visible.length === 0 ? "Nenhum modelo disponível no Ollama" : null);

      setSelectedModelState((prev) => {
        if (prev && visible.some((m) => m.name === prev)) {
          return prev;
        }
        const first = visible[0]?.name ?? "";
        if (first) {
          selectModel(ollamaUrl, first).catch(() => {});
        }
        return first;
      });
    } catch (err) {
      setModels([]);
      setIsConnected(false);
      setError("Não foi possível conectar à API Ollama");
    } finally {
      setIsLoading(false);
    }
  }, [ollamaUrl, modelPreferences, setLastKnownModels]);

  const selectModelByName = useCallback(
    (name: string) => {
      setSelectedModelState(name);
      if (ollamaUrl && name) {
        selectModel(ollamaUrl, name).catch(() => {});
      }
    },
    [ollamaUrl],
  );

  // Initial fetch and periodic polling
  useEffect(() => {
    refreshModels();

    const interval = setInterval(() => {
      refreshModels();
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [refreshModels, pollIntervalMs]);

  return {
    models,
    selectedModel,
    setSelectedModel: selectModelByName,
    isConnected,
    isLoading,
    error,
    refreshModels,
  };
}

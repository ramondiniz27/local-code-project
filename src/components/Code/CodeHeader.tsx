import { useState } from "react";
import { GitBranch, Sparkles, ChevronDown, GitCommitHorizontal, FolderGit2, AlertCircle } from "lucide-react";
import { useModels } from "../../hooks/useModels";
import { useOllamaErrorToast } from "../../hooks/useOllamaErrorToast";
import { useSettingsStore } from "../../store/settingsStore";

interface CodeHeaderProps {
  onCommit?: () => void;
  onSelectModel?: (model: string) => void;
}

export function CodeHeader({ onCommit, onSelectModel }: CodeHeaderProps) {
  const { models, selectedModel, setSelectedModel, isConnected, error } = useModels(5000);
  const ollamaUrl = useSettingsStore((s) => s.ollamaUrl);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Show a toast when Ollama is unreachable (deduped; CodeHeader polls independently)
  useOllamaErrorToast(models.length === 0 ? error : null, ollamaUrl);

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    setIsDropdownOpen(false);
    onSelectModel?.(modelName);
  };

  return (
    <header className="flex h-[48px] w-full items-center justify-between border-b border-[#2d2d48] bg-[#1c1c2e] px-4 shrink-0 text-sm">
      {/* Left side: Repo, Branch, Diff Stat */}
      <div className="flex items-center gap-3">
        {/* Repo Chip */}
        <div className="flex items-center gap-1.5 rounded-md bg-[#2a2a42] px-2.5 py-1 text-xs font-medium text-white shadow-xs">
          <FolderGit2 className="h-3.5 w-3.5 text-[#60a5fa]" />
          <span>—</span>
        </div>

        {/* Branch Chip */}
        <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[#9ca3af]">
          <GitBranch className="h-3.5 w-3.5 text-[#9ca3af]" />
          <span className="font-mono">—</span>
        </div>


      </div>

      {/* Right side: Model Dropdown & Commit Button */}
      <div className="flex items-center gap-3 relative">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-md bg-[#2a2a42] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#343452] focus:outline-none"
          >
            {isConnected ? (
              <Sparkles className="h-3.5 w-3.5 text-[#60a5fa]" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            )}
            <span className="truncate max-w-[160px]">
              {selectedModel || (isConnected ? "Selecionar modelo" : "Nenhum modelo disponível")}
            </span>
            <ChevronDown className="h-3 w-3 text-[#9ca3af]" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-md border border-[#374151] bg-[#20203a] p-1.5 shadow-lg">
                {models.length === 0 ? (
                  <div className="flex flex-col gap-1.5 p-2.5 text-xs text-[#9ca3af]">
                    <div className="flex items-center gap-2 font-medium text-amber-400">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Nenhum modelo disponível</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#8c8ca8]">
                      Não encontramos modelos ativos no Ollama. Tentando reconectar à API periodicamente...
                    </p>
                  </div>
                ) : (
                  models.map((model) => (
                    <button
                      key={model.name}
                      type="button"
                      onClick={() => handleModelChange(model.name)}
                      className={`flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-xs ${
                        model.name === selectedModel
                          ? "bg-[#3b82f6] text-white font-medium"
                          : "text-[#d4d4e0] hover:bg-[#2c2c48]"
                      }`}
                    >
                      <span className="truncate">{model.name}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Commit Button */}
        <button
          type="button"
          onClick={onCommit}
          className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#2563eb] active:scale-95"
        >
          <GitCommitHorizontal className="h-4 w-4" />
          <span>Commit</span>
        </button>
      </div>
    </header>
  );
}

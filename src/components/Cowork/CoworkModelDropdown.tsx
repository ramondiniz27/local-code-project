import { useEffect } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCoworkStore } from "@/store/coworkStore";

function formatSize(bytes: number): string {
  if (!bytes) return "";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export function CoworkModelDropdown() {
  const {
    isModelDropdownOpen,
    selectedModel,
    availableModels,
    setSelectedModel,
    setModelDropdownOpen,
    fetchAvailableModels,
  } = useCoworkStore();

  useEffect(() => {
    fetchAvailableModels();

    // Poll periodically every 5 seconds if dropdown is open or no models available
    const timer = setInterval(() => {
      fetchAvailableModels();
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchAvailableModels]);

  if (!isModelDropdownOpen) return null;

  return (
    <>
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setModelDropdownOpen(false)}
      />

      {/* Floating Dropdown Card */}
      <div className="absolute right-36 top-14 z-50 w-[280px] rounded-xl border border-border-light bg-bg-input p-1.5 shadow-xl">
        {/* Cabeçalho */}
        <div className="px-2.5 pt-2 pb-1.5 border-b border-border-light/50 mb-1">
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
            MODELO DAS TAREFAS DO COWORK
          </span>
        </div>

        {/* Lista de Modelos */}
        <div className="flex flex-col gap-0.5">
          {availableModels.length === 0 ? (
            <div className="flex flex-col gap-1.5 p-3 text-xs text-text-muted">
              <div className="flex items-center gap-2 font-medium text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>Nenhum modelo disponível</span>
              </div>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Não encontramos modelos ativos na API do Ollama. Tentando reconectar periodicamente...
              </p>
            </div>
          ) : (
            availableModels.map((m) => {
              const isSelected = selectedModel === m.name;
              const desc = formatSize(m.size) || "Modelo local Ollama";
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setSelectedModel(m.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#f0f4ff]"
                      : "hover:bg-black/5"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-2">
                    <span
                      className={`text-xs truncate ${
                        isSelected
                          ? "font-semibold text-accent-blue"
                          : "font-normal text-text-primary"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      {desc}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant="secondary"
                        className="rounded bg-[#eff6ff] text-accent-blue text-[10px] font-semibold px-1.5 py-0.5 border-0"
                      >
                        Atual
                      </Badge>
                      <Check className="h-4 w-4 text-accent-blue" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

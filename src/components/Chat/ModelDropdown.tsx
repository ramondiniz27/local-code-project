import { Check } from "lucide-react";
import type { OllamaModel } from "../../lib/ollama";

interface ModelDropdownProps {
  models: OllamaModel[];
  selectedModel: string;
  onSelect: (name: string) => void;
}

export function ModelDropdown({ models, selectedModel, onSelect }: ModelDropdownProps) {
  return (
    <div className="absolute left-4 top-14 z-10 flex w-[260px] flex-col gap-0.5 rounded-[10px] border border-border-light bg-bg-input p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      {models.length === 0 && (
        <p className="px-3 py-2.5 text-[13px] text-text-muted">
          Nenhum modelo encontrado no Ollama
        </p>
      )}
      {models.map((model) => {
        const selected = model.name === selectedModel;
        return (
          <button
            key={model.name}
            type="button"
            onClick={() => onSelect(model.name)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left ${
              selected ? "bg-[#f0f4ff]" : "bg-transparent hover:bg-bg-main"
            }`}
          >
            <span
              className={`min-w-0 flex-1 truncate text-[13px] ${
                selected ? "font-semibold text-accent-blue" : "text-text-primary"
              }`}
            >
              {model.name}
            </span>
            {selected && <Check className="h-4 w-4 text-accent-blue" />}
          </button>
        );
      })}
    </div>
  );
}

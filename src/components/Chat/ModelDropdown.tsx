import { Check } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { OllamaModel } from "../../lib/ollama";

interface ModelDropdownProps {
  models: OllamaModel[];
  selectedModel: string;
  onSelect: (name: string) => void;
}

export function ModelDropdown({ models, selectedModel, onSelect }: ModelDropdownProps) {
  return (
    <DropdownMenuContent
      align="start"
      className="w-[280px] flex-col gap-0.5 rounded-[10px] border border-border-light bg-bg-input p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
    >
      {models.length === 0 && (
        <div className="flex flex-col gap-1.5 p-3 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-medium text-amber-500">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span>Nenhum modelo disponível</span>
          </div>
          <p className="text-[11px] leading-relaxed text-text-muted">
            Não foram encontrados modelos ativos no Ollama. Tentando conectar à API periodicamente...
          </p>
        </div>
      )}
      {models.map((model) => {
        const selected = model.name === selectedModel;
        return (
          <DropdownMenuItem
            key={model.name}
            onSelect={() => onSelect(model.name)}
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
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}

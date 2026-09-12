import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModelDropdown } from "./ModelDropdown";
import { SettingsModal } from "../Settings/SettingsModal";
import type { OllamaModel } from "../../lib/ollama";

interface ChatHeaderProps {
  modelName: string;
  models: OllamaModel[];
  selectedModel: string;
  onSelectModel: (name: string) => void;
}

export function ChatHeader({
  modelName,
  models,
  selectedModel,
  onSelectModel,
}: ChatHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-bg-input px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-bg-main"
          >
            <span className="text-[15px] font-semibold text-text-primary">
              {modelName}
            </span>
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </Button>
        </DropdownMenuTrigger>
        <ModelDropdown
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelectModel}
        />
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-5 w-5 text-text-secondary" />
        </button>
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}

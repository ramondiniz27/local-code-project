import { ChevronDown, Settings, Share } from "lucide-react";

interface ChatHeaderProps {
  modelName: string;
  onToggleModels: () => void;
}

export function ChatHeader({ modelName, onToggleModels }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-bg-input px-6">
      <button
        type="button"
        onClick={onToggleModels}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-bg-main"
      >
        <span className="text-[15px] font-semibold text-text-primary">
          {modelName}
        </span>
        <ChevronDown className="h-4 w-4 text-text-secondary" />
      </button>
      <div className="flex items-center gap-2">
        <Share className="h-5 w-5 text-text-secondary" />
        <Settings className="h-5 w-5 text-text-secondary" />
      </div>
    </header>
  );
}

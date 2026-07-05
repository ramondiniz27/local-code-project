import { ChevronDown, Settings, Share } from "lucide-react";

export function ChatHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-bg-input px-6">
      <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
        <span className="text-[15px] font-semibold text-text-primary">
          Claude 3.5 Sonnet
        </span>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#eff6ff] text-accent-blue">
          Latest
        </span>
        <ChevronDown className="h-4 w-4 text-text-secondary" />
      </div>
      <div className="flex items-center gap-2">
        <Share className="h-5 w-5 text-text-secondary" />
        <Settings className="h-5 w-5 text-text-secondary" />
      </div>
    </header>
  );
}

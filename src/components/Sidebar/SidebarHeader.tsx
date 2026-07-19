import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  onNewChat: () => void;
  disabled: boolean;
}

export function SidebarHeader({ onNewChat, disabled }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-base font-bold text-text-light">Claude</span>
      <Button
        type="button"
        size="icon"
        onClick={onNewChat}
        disabled={disabled}
        className="h-8 w-8 rounded-lg bg-accent-blue hover:bg-accent-blue/90"
        aria-label="New chat"
      >
        <Plus className="h-[18px] w-[18px] text-text-light" />
      </Button>
    </div>
  );
}

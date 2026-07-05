import { Plus } from "lucide-react";

export function SidebarHeader() {
  return (
    <div className="flex items-center justify-between px-1 py-1">
      <span className="text-base font-bold text-text-light">Claude</span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue"
        aria-label="New chat"
      >
        <Plus className="h-[18px] w-[18px] text-text-light" />
      </button>
    </div>
  );
}

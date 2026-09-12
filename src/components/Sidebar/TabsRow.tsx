import { Code, MessageCircle, Users } from "lucide-react";

export type TabType = "chat" | "code" | "cowork";

interface TabsRowProps {
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "code", label: "Code", icon: Code },
  { id: "cowork", label: "Cowork", icon: Users },
];

export function TabsRow({ activeTab = "chat", onSelectTab }: TabsRowProps) {
  return (
    <div className="flex gap-1 px-0.5 py-0.5 bg-black/10 rounded-xl p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab?.(tab.id)}
            className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-bg-hover text-text-light shadow-sm"
                : "bg-transparent text-text-muted hover:text-text-light hover:bg-white/5"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent-blue-light" : ""}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

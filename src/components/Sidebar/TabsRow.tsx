import { Code, MessageCircle, Users } from "lucide-react";

const tabs = [
  { id: "chat", label: "Chat", icon: MessageCircle, active: true },
  { id: "code", label: "Code", icon: Code, active: false },
  { id: "cowork", label: "Cowork", icon: Users, active: false },
];

export function TabsRow() {
  return (
    <div className="flex gap-1 px-0.5 py-0.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold ${
              tab.active
                ? "bg-bg-hover text-text-light"
                : "bg-transparent text-text-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

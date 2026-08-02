import { useState } from "react";
import { FileCode, GitCompare, File } from "lucide-react";
import { CodeDiffView } from "./CodeDiffView";
import { SuggestionCard } from "./SuggestionCard";
import { TerminalPanel } from "./TerminalPanel";
import { CodeEmptyState } from "./CodeEmptyState";

export interface EditorTab {
  id: string;
  name: string;
  active: boolean;
  modified: boolean;
}

export function EditorColumn() {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [viewMode, setViewMode] = useState<"diff" | "arquivo">("diff");
  const [showTerminal, setShowTerminal] = useState(true);

  const activeTab = tabs.find((t) => t.active) || tabs[0];
  const hasTabs = tabs.length > 0;

  const handleSelectTab = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => ({ ...t, active: t.id === id }))
    );
  };

  if (!hasTabs) {
    return (
      <div className="flex h-full flex-1 flex-col bg-[#181828] overflow-hidden min-w-0">
        <CodeEmptyState />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-[#181828] overflow-hidden min-w-0">
      {/* Top Tab Bar & View Mode Toggle */}
      <div className="flex h-[38px] w-full items-center justify-between border-b border-[#2d2d48] bg-[#20203a] px-2 shrink-0 select-none">
        {/* Tabs List */}
        <div className="flex items-center h-full gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex h-full items-center gap-2 px-3.5 text-xs font-medium cursor-pointer transition-colors border-t-2 ${
                tab.active
                  ? "bg-[#181828] text-white border-[#3b82f6]"
                  : "bg-transparent text-[#9ca3af] border-transparent hover:text-white hover:bg-[#282845]"
              }`}
            >
              <FileCode
                className={`h-3.5 w-3.5 ${
                  tab.active ? "text-[#e5c07b]" : "text-[#9ca3af]"
                }`}
              />
              <span>{tab.name}</span>
              {tab.modified && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    tab.active ? "bg-[#e5c07b]" : "bg-[#4b5563]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* View Mode Toggle (Diff vs Arquivo) */}
        <div className="flex items-center gap-1 rounded-md bg-[#181828] p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("diff")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors ${
              viewMode === "diff"
                ? "bg-[#2d2d4c] text-white shadow-xs"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            <GitCompare className="h-3 w-3" />
            <span>Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("arquivo")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors ${
              viewMode === "arquivo"
                ? "bg-[#2d2d4c] text-white shadow-xs"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            <File className="h-3 w-3" />
            <span>Arquivo</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      {activeTab && (
        <div className="flex h-[30px] w-full items-center justify-between border-b border-[#24243a] bg-[#1a1a2c] px-3.5 text-xs text-[#9ca3af] shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-white font-medium">{activeTab.name}</span>
          </div>
          <div className="text-[11px]">Comparando com main</div>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <CodeDiffView />
        <SuggestionCard />
      </div>

      {/* Terminal Panel */}
      {showTerminal && (
        <TerminalPanel onClose={() => setShowTerminal(false)} />
      )}
    </div>
  );
}

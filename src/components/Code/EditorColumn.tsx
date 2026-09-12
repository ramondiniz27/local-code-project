import { useEffect, useState } from "react";
import { FileCode, GitCompare, File as FileIcon, X, Save, Terminal as TerminalIcon } from "lucide-react";
import { CodeDiffView, type DiffLine } from "./CodeDiffView";
import { SuggestionCard } from "./SuggestionCard";
import { TerminalPanel } from "./TerminalPanel";
import { CodeEmptyState } from "./CodeEmptyState";
import { ReadmePreview } from "./ReadmePreview";
import { useCodeStore } from "../../store/codeStore";

export function EditorColumn() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const {
    openTabs,
    activeTabPath,
    viewMode,
    openProject,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    setViewMode,
  } = useCodeStore();

  const activeTab = openTabs.find((t) => t.path === activeTabPath) || openTabs[0];
  const hasTabs = openTabs.length > 0;

  // Keyboard shortcut Cmd+S / Ctrl+S to save active file
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeTabPath) {
          saveTab(activeTabPath);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabPath, saveTab]);

  if (!hasTabs) {
    const { projectPath } = useCodeStore();
    return (
      <div className="flex h-full flex-1 flex-col bg-[#181828] overflow-hidden min-w-0">
        {projectPath ? (
          <ReadmePreview />
        ) : (
          <CodeEmptyState onOpenProject={() => openProject()} />
        )}
      </div>
    );
  }

  // Generate diff lines for Diff mode
  const getDiffLines = (): DiffLine[] => {
    if (!activeTab) return [];
    const origLines = activeTab.originalContent.split("\n");
    const currLines = activeTab.content.split("\n");
    const diff: DiffLine[] = [];

    let lineNum = 1;
    const maxLen = Math.max(origLines.length, currLines.length);

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i];
      const curr = currLines[i];

      if (orig === curr) {
        if (curr !== undefined) {
          diff.push({
            id: `line-${i}`,
            num: lineNum++,
            prefix: " ",
            type: "normal",
            code: curr,
          });
        }
      } else {
        if (orig !== undefined) {
          diff.push({
            id: `line-del-${i}`,
            num: "−",
            prefix: "−",
            type: "del",
            code: orig,
          });
        }
        if (curr !== undefined) {
          diff.push({
            id: `line-add-${i}`,
            num: lineNum++,
            prefix: "+",
            type: "add",
            code: curr,
          });
        }
      }
    }

    return diff;
  };

  const lineCount = activeTab ? activeTab.content.split("\n").length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex h-full flex-1 flex-col bg-[#181828] overflow-hidden min-w-0">
      {/* Top Tab Bar & View Mode Toggle */}
      <div className="flex h-[38px] w-full items-center justify-between border-b border-[#2d2d48] bg-[#20203a] px-2 shrink-0 select-none">
        {/* Tabs List */}
        <div className="flex items-center h-full gap-1 overflow-x-auto">
          {openTabs.map((tab) => {
            const isActive = tab.path === activeTabPath;
            return (
              <div
                key={tab.path}
                onClick={() => setActiveTab(tab.path)}
                className={`flex h-full items-center gap-2 px-3 text-xs font-medium cursor-pointer transition-colors border-t-2 shrink-0 ${
                  isActive
                    ? "bg-[#181828] text-white border-[#3b82f6]"
                    : "bg-transparent text-[#9ca3af] border-transparent hover:text-white hover:bg-[#282845]"
                }`}
              >
                <FileCode
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-[#60a5fa]" : "text-[#9ca3af]"
                  }`}
                />
                <span className="truncate max-w-[140px]">{tab.name}</span>

                {tab.isModified && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e5c07b]" title="Arquivo alterado" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.path);
                  }}
                  className="rounded p-0.5 text-[#9ca3af] hover:bg-[#343452] hover:text-white transition-colors ml-1"
                  title="Fechar aba"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* View Mode Toggle (Diff vs Arquivo) */}
        <div className="flex items-center gap-1 rounded-md bg-[#181828] p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("diff")}
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors cursor-pointer ${
              viewMode === "arquivo"
                ? "bg-[#2d2d4c] text-white shadow-xs"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            <FileIcon className="h-3 w-3" />
            <span>Arquivo</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb & Action Bar */}
      {activeTab && (
        <div className="flex h-[32px] w-full items-center justify-between border-b border-[#24243a] bg-[#1a1a2c] px-3.5 text-xs text-[#9ca3af] shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-white font-medium">{activeTab.path}</span>
            {activeTab.isModified && (
              <span className="text-[10px] text-[#e5c07b] font-mono italic">(não salvo)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => saveTab(activeTab.path)}
              className={`flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab.isModified
                  ? "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                  : "bg-[#2a2a42] text-[#9ca3af] hover:text-white"
              }`}
              title="Salvar alterações (Cmd+S / Ctrl+S)"
            >
              <Save className="h-3 w-3" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {viewMode === "diff" ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <CodeDiffView lines={getDiffLines()} />
            <SuggestionCard />
          </div>
        ) : (
          <div className="flex flex-1 h-full w-full overflow-hidden bg-[#181828]">
            {/* Line Numbers Gutter */}
            <div className="flex flex-col select-none py-3 px-2 text-right font-mono text-xs text-[#4b5563] bg-[#141426] border-r border-[#24243a] min-w-[40px] shrink-0">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Live Interactive Code Textarea */}
            <textarea
              value={activeTab?.content || ""}
              onChange={(e) => {
                if (activeTabPath) {
                  updateTabContent(activeTabPath, e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const value = target.value;
                  const newValue = value.substring(0, start) + "  " + value.substring(end);
                  if (activeTabPath) {
                    updateTabContent(activeTabPath, newValue);
                  }
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 2;
                  }, 0);
                }
              }}
              spellCheck={false}
              className="flex-1 h-full w-full bg-transparent p-3 font-mono text-xs text-[#d4d4e0] leading-6 resize-none focus:outline-none overflow-y-auto whitespace-pre tab-4"
            />
          </div>
        )}
      </div>

      {/* Terminal Panel */}
      {isTerminalOpen ? (
        <TerminalPanel onClose={() => setIsTerminalOpen(false)} />
      ) : (
        <div className="flex h-8 w-full items-center justify-between border-t border-[#2d2d48] bg-[#14142a] px-3.5 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setIsTerminalOpen(true)}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          >
            <TerminalIcon className="h-3.5 w-3.5 text-[#60a5fa]" />
            <span>Terminal (Minimizado)</span>
          </button>
        </div>
      )}
    </div>
  );
}

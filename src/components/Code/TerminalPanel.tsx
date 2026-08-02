import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Plus, X, Loader2, Play } from "lucide-react";
import { runScript } from "../../lib/filesystem";
import { useCodeStore } from "../../store/codeStore";
import { useFilesystemStore } from "../../store/filesystemStore";

export interface ExecutionLogItem {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  isRunning?: boolean;
}

interface TerminalPanelProps {
  onClose?: () => void;
}

export function TerminalPanel({ onClose }: TerminalPanelProps) {
  const { projectPath, projectName } = useCodeStore();
  const workingDirectory = useFilesystemStore((s) => s.workingDirectory);
  const activeDir = projectPath || workingDirectory || "./";

  const [logs, setLogs] = useState<ExecutionLogItem[]>([]);
  const [cmdInput, setCmdInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll output feed to bottom when logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExecuting]);

  const handleRunCommand = async () => {
    const trimmed = cmdInput.trim();
    if (!trimmed || isExecuting) return;

    setCmdInput("");
    setCommandHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setIsExecuting(true);

    const logId = Date.now().toString();
    const newLog: ExecutionLogItem = {
      id: logId,
      command: trimmed,
      stdout: "",
      stderr: "",
      exitCode: null,
      isRunning: true,
    };

    setLogs((prev) => [...prev, newLog]);

    try {
      const res = await runScript(trimmed, activeDir);
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                stdout: res.stdout,
                stderr: res.stderr,
                exitCode: res.exitCode,
                isRunning: false,
              }
            : log
        )
      );
    } catch (err: any) {
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                stderr: err.message || String(err),
                exitCode: -1,
                isRunning: false,
              }
            : log
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRunCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(nextIdx);
      setCmdInput(commandHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setCmdInput("");
      } else {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCmdInput(commandHistory[nextIdx]);
      }
    }
  };

  const handleClearTerminal = () => {
    setLogs([]);
  };

  return (
    <div className="flex h-[185px] w-full flex-col border-t border-[#2d2d48] bg-[#14142a] shrink-0 font-mono text-xs select-text">
      {/* Header */}
      <div className="flex h-8 w-full items-center justify-between border-b border-[#24243e] px-3.5 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-[#60a5fa]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
            Terminal · {projectName !== "—" ? projectName : "localcode CLI"}
          </span>
          <span className="text-[10px] text-[#6b7280] truncate max-w-[200px]">
            ({activeDir})
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleClearTerminal}
            className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
            title="Limpar Terminal"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
              title="Fechar Terminal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Logs & Output Feed */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 p-3 overflow-y-auto"
      >
        {logs.length === 0 && (
          <div className="text-[11px] text-[#4b5563] italic">
            Terminal pronto em {activeDir}. Digite um comando para executar (ex: ruby helloworld.rb, ls, npm test)
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="flex flex-col gap-1">
            {/* Command Header Line */}
            <div className="flex items-center gap-2 text-white font-semibold">
              <span className="text-[#60a5fa]">$</span>
              <span>{log.command}</span>
              {log.isRunning && (
                <Loader2 className="h-3 w-3 text-[#60a5fa] animate-spin ml-1" />
              )}
              {log.exitCode !== null && (
                <span
                  className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    log.exitCode === 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  exit {log.exitCode}
                </span>
              )}
            </div>

            {/* Standard Output */}
            {log.stdout && (
              <pre className="whitespace-pre-wrap break-all text-[#d4d4e0] pl-4 font-mono leading-relaxed text-[11px]">
                {log.stdout}
              </pre>
            )}

            {/* Standard Error */}
            {log.stderr && (
              <pre className="whitespace-pre-wrap break-all text-rose-400 pl-4 font-mono leading-relaxed text-[11px]">
                {log.stderr}
              </pre>
            )}
          </div>
        ))}

        {/* Interactive Prompt Command Input Line */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[#60a5fa] font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={
              isExecuting
                ? "Executando comando..."
                : "Digite um comando shell..."
            }
            className="flex-1 bg-transparent text-xs text-white placeholder-[#4b5563] focus:outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleRunCommand}
            disabled={isExecuting || !cmdInput.trim()}
            className="text-[#60a5fa] hover:text-white disabled:opacity-30 transition-colors cursor-pointer p-0.5"
            title="Executar comando"
          >
            <Play className="h-3 w-3 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

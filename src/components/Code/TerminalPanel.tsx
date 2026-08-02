import { Terminal as TerminalIcon, Plus, X } from "lucide-react";

export interface TerminalLog {
  id: string;
  prompt: string;
  promptColor: string;
  text: string;
  textColor: string;
}

interface TerminalPanelProps {
  logs?: TerminalLog[];
  onClose?: () => void;
}

export function TerminalPanel({ logs = [], onClose }: TerminalPanelProps) {
  return (
    <div className="flex h-[172px] w-full flex-col border-t border-[#2d2d48] bg-[#14142a] shrink-0 font-mono text-xs select-text">
      {/* Top Header */}
      <div className="flex h-8 w-full items-center justify-between border-b border-[#24243e] px-3.5 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-[#9ca3af]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
            Terminal · localcode CLI
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="text-[#9ca3af] hover:text-white transition-colors"
            title="Novo Terminal"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9ca3af] hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 overflow-y-auto">
        {logs.length === 0 ? (
          <span className="text-[11px] italic text-[#4b5563]">
            Aguardando comandos...
          </span>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
              <span
                className="font-bold shrink-0"
                style={{ color: log.promptColor }}
              >
                {log.prompt}
              </span>
              <span
                className="break-all"
                style={{ color: log.textColor }}
              >
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

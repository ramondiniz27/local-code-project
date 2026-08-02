import { useState } from "react";
import { Bot, Ellipsis, Plus, ArrowUp } from "lucide-react";

export function AssistantPanel() {
  const [inputVal, setInputVal] = useState("");

  return (
    <aside className="flex h-full w-[300px] flex-col border-l border-[#2d2d48] bg-[#20203a] shrink-0 text-xs select-none">
      {/* Header */}
      <div className="flex h-[40px] w-full items-center justify-between border-b border-[#2d2d48] px-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#60a5fa]" />
          <span className="font-semibold text-white">Assistente</span>
        </div>
        <button
          type="button"
          className="text-[#9ca3af] hover:text-white transition-colors"
          title="Opções"
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>

      {/* Context Chips */}
      <div className="flex items-center gap-1.5 p-3 flex-wrap border-b border-[#292944]">
        <span className="text-[11px] italic text-[#4b5563]">
          Nenhum contexto adicionado
        </span>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-[#374151] px-2 py-0.5 text-xs text-[#9ca3af] hover:bg-[#282845] hover:text-white transition-colors"
        >
          <Plus className="h-2.5 w-2.5" />
          <span>Contexto</span>
        </button>
      </div>

      {/* Chat & Tasks Area */}
      <div className="flex flex-1 flex-col gap-3.5 p-3.5 overflow-y-auto items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2d4c]">
            <Bot className="h-5 w-5 text-[#60a5fa]/60" />
          </div>
          <p className="text-[11px] italic text-[#4b5563]">
            Nenhuma tarefa em andamento
          </p>
        </div>
      </div>

      {/* Assistant Input */}
      <div className="px-3.5 pb-3.5">
        <div className="flex items-center justify-between rounded-lg border border-[#2d2d48] bg-[#14142a] px-3 py-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Pergunte sobre o código..."
            className="w-full bg-transparent text-xs text-white placeholder-[#9ca3af] focus:outline-none"
          />
          <button
            type="button"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#3b82f6] text-white transition-colors hover:bg-[#2563eb] active:scale-95 ml-2"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

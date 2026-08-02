import { useState, useRef } from "react";
import { Bot, Ellipsis, Plus, ArrowUp, X, Sparkles, FileCode } from "lucide-react";
import { useCodeStore } from "../../store/codeStore";
import { streamChat, type ChatMessage } from "../../lib/ollama";

export function AssistantPanel() {
  const [inputVal, setInputVal] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [assistantOutput, setAssistantOutput] = useState("");
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const streamingRef = useRef("");

  const {
    projectPath,
    projectName,
    fileTree,
    openTabs,
    activeTabPath,
    contextChips,
    attachContextChip,
    removeContextChip,
    updateTabContent,
  } = useCodeStore();

  const activeTab = openTabs.find((t) => t.path === activeTabPath);

  const handleSend = async () => {
    const trimmed = inputVal.trim();
    if (!trimmed || isStreaming) return;

    setInputVal("");
    setAssistantOutput("");
    streamingRef.current = "";
    setIsStreaming(true);

    // Build context prompt with active file and attached context chips
    let contextText = `Você é um assistente de código atuando no projeto: ${projectName} (${projectPath || "./"})\n\n`;

    if (activeTab) {
      contextText += `--- Arquivo Ativo Atual: ${activeTab.path} ---\n\`\`\`\n${activeTab.content}\n\`\`\`\n\n`;
    }

    if (contextChips.length > 0) {
      contextText += `--- Arquivos de Contexto Adicionais ---\n`;
      for (const chip of contextChips) {
        contextText += `[Contexto: ${chip.path}]\n\`\`\`\n${chip.content}\n\`\`\`\n\n`;
      }
    }

    const fullPrompt = `${contextText}\nInstruções: Ajude o usuário a analisar, refatorar, editar ou gerar código para o projeto. Responda em português com código claro e bem explicado.\n\nSolicitação do Usuário: ${trimmed}`;

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: fullPrompt,
      },
    ];

    try {
      await streamChat(messages, (chunk) => {
        streamingRef.current += chunk;
        setAssistantOutput(streamingRef.current);
      });
    } catch (err) {
      setAssistantOutput((prev) => prev + `\n[Erro na geração: ${String(err)}]`);
    } finally {
      setIsStreaming(false);
    }
  };

  // Extract code block from output to allow applying to active editor tab
  const codeMatch = assistantOutput.match(/```(?:[a-zA-Z0-9_\-]+)?\n([\s\S]*?)\n```/);
  const suggestedCode = codeMatch ? codeMatch[1].trim() : null;

  const handleApplyCode = () => {
    if (suggestedCode && activeTabPath) {
      updateTabContent(activeTabPath, suggestedCode);
    }
  };

  return (
    <aside className="flex h-full w-[320px] flex-col border-l border-[#2d2d48] bg-[#20203a] shrink-0 text-xs select-none">
      {/* Header */}
      <div className="flex h-[40px] w-full items-center justify-between border-b border-[#2d2d48] px-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#60a5fa]" />
          <span className="font-semibold text-white">Assistente</span>
        </div>
        <button
          type="button"
          className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          title="Opções"
        >
          <Ellipsis className="h-4 w-4" />
        </button>
      </div>

      {/* Context Chips Bar */}
      <div className="relative flex items-center gap-1.5 p-3 flex-wrap border-b border-[#292944] min-h-[44px]">
        {/* Active tab auto-chip */}
        {activeTab && (
          <span className="flex items-center gap-1 rounded bg-[#2a2a48] border border-[#3b82f6]/40 px-2 py-0.5 text-[11px] text-[#60a5fa] font-mono">
            <FileCode className="h-3 w-3" />
            <span className="truncate max-w-[100px]">@{activeTab.name}</span>
          </span>
        )}

        {/* Attached context chips */}
        {contextChips.map((chip) => (
          <span
            key={chip.id}
            className="flex items-center gap-1 rounded bg-[#2a2a48] border border-[#374151] px-2 py-0.5 text-[11px] text-[#d4d4e0] font-mono"
          >
            <span className="truncate max-w-[100px]">@{chip.name}</span>
            <button
              type="button"
              onClick={() => removeContextChip(chip.id)}
              className="hover:text-rose-400 text-[#9ca3af] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {/* Add Context Button */}
        {projectPath && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
              className="flex items-center gap-1 rounded border border-[#374151] px-2 py-0.5 text-[11px] text-[#9ca3af] hover:bg-[#282845] hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Contexto</span>
            </button>

            {isContextDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsContextDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-50 w-56 max-h-48 overflow-y-auto rounded-md border border-[#374151] bg-[#1a1a2c] p-1 shadow-lg">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#9ca3af]">
                    Adicionar Arquivo ao Contexto
                  </div>
                  {fileTree.filter((e) => e.kind === "file").length === 0 ? (
                    <div className="px-2 py-1 text-xs italic text-[#6b7280]">
                      Nenhum arquivo encontrado
                    </div>
                  ) : (
                    fileTree
                      .filter((e) => e.kind === "file")
                      .map((file) => (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => {
                            attachContextChip(file.path);
                            setIsContextDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-[#b8bdd0] hover:bg-[#282845] hover:text-white truncate cursor-pointer"
                        >
                          <FileCode className="h-3 w-3 text-[#60a5fa] shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Output / Messages Area */}
      <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto font-mono text-xs select-text">
        {assistantOutput.length === 0 && !isStreaming ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2d4c]">
              <Bot className="h-5 w-5 text-[#60a5fa]/60" />
            </div>
            <p className="text-[11px] leading-relaxed text-[#6b7280]">
              Faça perguntas sobre o código do projeto ou solicite refatoração. O contexto do arquivo ativo é enviado automaticamente.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="rounded-lg bg-[#181828] p-3 text-[#d4d4e0] whitespace-pre-wrap leading-relaxed border border-[#2d2d48]">
              {assistantOutput}
              {isStreaming && (
                <span className="inline-block h-3 w-1.5 bg-[#60a5fa] animate-pulse ml-1" />
              )}
            </div>

            {/* Apply Code Action Card */}
            {suggestedCode && activeTabPath && (
              <div className="flex items-center justify-between rounded-lg border border-[#3b82f6]/40 bg-[#1e293b] p-2.5">
                <div className="flex items-center gap-1.5 text-[#60a5fa] font-sans font-medium text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Código sugerido para {activeTab?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCode}
                  className="rounded bg-[#3b82f6] px-2.5 py-1 font-sans text-xs font-semibold text-white hover:bg-[#2563eb] transition-colors cursor-pointer"
                >
                  Aplicar no editor
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assistant Prompt Input */}
      <div className="p-3">
        <div className="flex items-center justify-between rounded-lg border border-[#2d2d48] bg-[#14142a] px-3 py-2 focus-within:border-[#3b82f6]">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte sobre o código..."
            className="w-full bg-transparent text-xs text-white placeholder-[#9ca3af] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming || !inputVal.trim()}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#3b82f6] text-white transition-colors hover:bg-[#2563eb] active:scale-95 disabled:opacity-50 cursor-pointer ml-2"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

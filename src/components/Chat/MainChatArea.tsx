import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { InputArea } from "./InputArea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage, OllamaModel } from "../../lib/ollama";

interface MainChatAreaProps {
  messages: ChatMessage[];
  models: OllamaModel[];
  selectedModel: string;
  isStreaming: boolean;
  error: string | null;
  onSelectModel: (name: string) => void;
  onSend: (text: string) => void;
}

export function MainChatArea({
  messages,
  models,
  selectedModel,
  isStreaming,
  error,
  onSelectModel,
  onSend,
}: MainChatAreaProps) {
  return (
    <main className="relative flex h-full flex-1 flex-col bg-bg-main">
      <ChatHeader
        modelName={selectedModel || "Nenhum modelo"}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />
      <ScrollArea className="min-h-0 flex-1">
        <MessagesArea messages={messages} error={error} />
      </ScrollArea>
      <InputArea onSend={onSend} disabled={isStreaming || !selectedModel} />
    </main>
  );
}

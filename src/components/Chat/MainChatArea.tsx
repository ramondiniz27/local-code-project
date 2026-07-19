import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { InputArea } from "./InputArea";
import { ModelDropdown } from "./ModelDropdown";
import { useOllamaChat } from "../../hooks/useOllamaChat";

interface MainChatAreaProps {
  ollamaUrl: string;
}

export function MainChatArea({ ollamaUrl }: MainChatAreaProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    models,
    selectedModel,
    setSelectedModel,
    messages,
    isStreaming,
    error,
    sendMessage,
  } = useOllamaChat(ollamaUrl);

  return (
    <main className="relative flex h-full flex-1 flex-col bg-bg-main">
      <ChatHeader
        modelName={selectedModel || "Nenhum modelo"}
        onToggleModels={() => setDropdownOpen((open) => !open)}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MessagesArea messages={messages} error={error} />
      </div>
      <InputArea onSend={sendMessage} disabled={isStreaming || !selectedModel} />
      {dropdownOpen && (
        <ModelDropdown
          models={models}
          selectedModel={selectedModel}
          onSelect={(name) => {
            setSelectedModel(name);
            setDropdownOpen(false);
          }}
        />
      )}
    </main>
  );
}

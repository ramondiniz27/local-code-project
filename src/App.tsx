import { useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MainChatArea } from "./components/Chat/MainChatArea";
import { SetupScreen } from "./components/SetupScreen";
import { useChats } from "./hooks/useChats";

function App() {
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("ollamaUrl"));

  if (!ollamaUrl) {
    return <SetupScreen onSave={setOllamaUrl} />;
  }

  return <Connected ollamaUrl={ollamaUrl} />;
}

function Connected({ ollamaUrl }: { ollamaUrl: string }) {
  const {
    chats,
    activeChatId,
    messages,
    models,
    selectedModel,
    isStreaming,
    error,
    startNewChat,
    selectChat,
    setSelectedModel,
    sendMessage,
  } = useChats(ollamaUrl);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={startNewChat}
        isStreaming={isStreaming}
      />
      <MainChatArea
        messages={messages}
        models={models}
        selectedModel={selectedModel}
        isStreaming={isStreaming}
        error={error}
        onSelectModel={setSelectedModel}
        onSend={sendMessage}
      />
    </div>
  );
}

export default App;

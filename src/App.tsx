import { useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import type { TabType } from "./components/Sidebar/TabsRow";
import { MainChatArea } from "./components/Chat/MainChatArea";
import { CoworkArea } from "./components/Cowork/CoworkArea";
import { CodeArea } from "./components/Code/CodeArea";
import { SetupScreen } from "./components/SetupScreen";
import { useChats } from "./hooks/useChats";
import { useSettingsStore } from "./store/settingsStore";
import { useOllamaErrorToast } from "./hooks/useOllamaErrorToast";

function App() {
  const ollamaUrl = useSettingsStore((s) => s.ollamaUrl);
  const setOllamaUrl = useSettingsStore((s) => s.setOllamaUrl);

  if (!ollamaUrl) {
    return <SetupScreen onSave={setOllamaUrl} />;
  }

  return <Connected ollamaUrl={ollamaUrl} />;
}

function Connected({ ollamaUrl }: { ollamaUrl: string }) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

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
    deleteChat,
    setSelectedModel,
    sendMessage,
  } = useChats(ollamaUrl);

  // Show a toast whenever Ollama is unreachable (deduped, auto-dismissed on recovery)
  useOllamaErrorToast(models.length === 0 ? error : null, ollamaUrl);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleNewChat = () => {
    setActiveTab("chat");
    startNewChat();
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveTab("chat");
          selectChat(id);
        }}
        onDeleteChat={deleteChat}
        onNewChat={handleNewChat}
        isStreaming={isStreaming}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {activeTab === "chat" && (
        <MainChatArea
          messages={messages}
          models={models}
          selectedModel={selectedModel}
          isStreaming={isStreaming}
          error={error}
          onSelectModel={setSelectedModel}
          onSend={sendMessage}
        />
      )}

      {activeTab === "cowork" && <CoworkArea />}

      {activeTab === "code" && <CodeArea />}
    </div>
  );
}

export default App;

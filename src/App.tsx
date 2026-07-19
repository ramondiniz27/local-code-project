import { useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { MainChatArea } from "./components/Chat/MainChatArea";
import { SetupScreen } from "./components/SetupScreen";

function App() {
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("ollamaUrl"));

  if (!ollamaUrl) {
    return <SetupScreen onSave={setOllamaUrl} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <MainChatArea ollamaUrl={ollamaUrl} />
    </div>
  );
}

export default App;

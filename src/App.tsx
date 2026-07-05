import { Sidebar } from "./components/Sidebar/Sidebar";
import { MainChatArea } from "./components/Chat/MainChatArea";

function App() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <MainChatArea />
    </div>
  );
}

export default App;

import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { InputArea } from "./InputArea";
import { ModelDropdown } from "./ModelDropdown";

export function MainChatArea() {
  return (
    <main className="relative flex h-full flex-1 flex-col bg-bg-main">
      <ChatHeader />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MessagesArea />
      </div>
      <InputArea />
      <ModelDropdown />
    </main>
  );
}

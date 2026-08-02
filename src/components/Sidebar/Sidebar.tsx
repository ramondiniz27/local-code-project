import { SidebarHeader } from "./SidebarHeader";
import { TabsRow, type TabType } from "./TabsRow";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StoredChat } from "../../lib/chatStorage";

interface SidebarProps {
  chats: StoredChat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onNewChat: () => void;
  isStreaming: boolean;
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  isStreaming,
  activeTab = "chat",
  onSelectTab,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col gap-3 bg-bg-sidebar px-3 py-4 border-r border-white/5">
      <SidebarHeader onNewChat={onNewChat} disabled={isStreaming} />
      <TabsRow activeTab={activeTab} onSelectTab={onSelectTab} />
      <SearchBar />
      <ScrollArea className="min-h-0 flex-1">
        <ConversationList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={onSelectChat}
          onDelete={onDeleteChat}
          disabled={isStreaming}
        />
      </ScrollArea>
    </aside>
  );
}

import { SidebarHeader } from "./SidebarHeader";
import { TabsRow } from "./TabsRow";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { ProfileSection } from "./ProfileSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StoredChat } from "../../lib/chatStorage";

interface SidebarProps {
  chats: StoredChat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  isStreaming: boolean;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  isStreaming,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[280px] flex-col gap-3 bg-bg-sidebar px-3 py-4">
      <SidebarHeader onNewChat={onNewChat} disabled={isStreaming} />
      <TabsRow />
      <SearchBar />
      <ScrollArea className="min-h-0 flex-1">
        <ConversationList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={onSelectChat}
          disabled={isStreaming}
        />
      </ScrollArea>
      <ProfileSection />
    </aside>
  );
}

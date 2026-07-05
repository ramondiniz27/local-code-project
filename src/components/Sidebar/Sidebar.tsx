import { SidebarHeader } from "./SidebarHeader";
import { TabsRow } from "./TabsRow";
import { SearchBar } from "./SearchBar";
import { ConversationList } from "./ConversationList";
import { ProfileSection } from "./ProfileSection";

export function Sidebar() {
  return (
    <aside className="flex h-full w-[280px] flex-col gap-3 bg-bg-sidebar px-3 py-4">
      <SidebarHeader />
      <TabsRow />
      <SearchBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList />
      </div>
      <ProfileSection />
    </aside>
  );
}

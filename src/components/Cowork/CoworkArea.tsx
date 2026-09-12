import { CoworkHeaderPen } from "./CoworkHeaderPen";
import { CoworkFeed } from "./CoworkFeed";
import { CoworkSidePanel } from "./CoworkSidePanel";
import { DiffViewerModal } from "./DiffViewerModal";
import { StopConfirmationModal } from "./StopConfirmationModal";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CoworkArea() {
  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden bg-bg-main">
      <CoworkHeaderPen />
      <ScrollArea className="min-h-0 flex-1 p-6">
        <div className="mx-auto flex max-w-6xl items-start gap-6 pb-8">
          <CoworkFeed />
          <CoworkSidePanel />
        </div>
      </ScrollArea>
      <DiffViewerModal />
      <StopConfirmationModal />
    </div>
  );
}

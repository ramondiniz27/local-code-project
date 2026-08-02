import { CodeHeader } from "./CodeHeader";
import { FileExplorer } from "./FileExplorer";
import { EditorColumn } from "./EditorColumn";
import { AssistantPanel } from "./AssistantPanel";

export function CodeArea() {
  return (
    <div className="flex h-full w-full flex-1 flex-col bg-[#141426] overflow-hidden">
      {/* Code Header Bar */}
      <CodeHeader />

      {/* Main Code Area Content (Explorer, Editor, Assistant) */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        <FileExplorer />

        {/* Center: Editor Column with Diff & Terminal */}
        <EditorColumn />

        {/* Right Sidebar: Assistant Panel */}
        <AssistantPanel />
      </div>
    </div>
  );
}

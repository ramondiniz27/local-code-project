import { useState } from "react";
import { Folder, FolderOpen, FileCode, FileText } from "lucide-react";

export interface ExplorerItem {
  id: string;
  name: string;
  type: "folder" | "file";
  open?: boolean;
  indent: number;
  badge?: "M" | "A" | "D";
  badgeColor?: string;
  active?: boolean;
}

export interface ChangedFile {
  name: string;
  badge: "M" | "A" | "D";
  badgeColor: string;
}

interface FileExplorerProps {
  onSelectFile?: (filename: string) => void;
}

export function FileExplorer({ onSelectFile }: FileExplorerProps) {
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const changedFiles: ChangedFile[] = [];

  const toggleFolder = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, open: !item.open } : item))
    );
  };

  const handleFileClick = (item: ExplorerItem) => {
    if (item.type === "folder") {
      toggleFolder(item.id);
    } else {
      setItems((prev) =>
        prev.map((i) => ({ ...i, active: i.id === item.id }))
      );
      onSelectFile?.(item.name);
    }
  };

  return (
    <aside className="flex h-full w-[224px] flex-col border-r border-[#2d2d48] bg-[#20203a] p-3 shrink-0 overflow-y-auto text-xs select-none">
      {/* Title */}
      <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
        Explorador
      </div>

      {/* File Tree */}
      <div className="flex flex-col gap-0.5">
        {items.length === 0 ? (
          <p className="px-1 py-2 text-[11px] italic text-[#4b5563]">
            Sem arquivos — inicie uma sessão Cowork
          </p>
        ) : (
          items.map((item) => {
            const isActive = item.active;
            return (
              <div
                key={item.id}
                onClick={() => handleFileClick(item)}
                style={{ paddingLeft: `${item.indent + 6}px` }}
                className={`flex items-center justify-between rounded-md py-1 pr-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#2d2d4c] text-white font-medium"
                    : "text-[#b8bdd0] hover:bg-[#282845] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {item.type === "folder" ? (
                    item.open ? (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                    )
                  ) : (
                    <FileCode
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: item.badgeColor || "#9ca3af" }}
                    />
                  )}
                  <span
                    className="truncate"
                    style={item.badgeColor && !isActive ? { color: item.badgeColor } : undefined}
                  >
                    {item.name}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className="ml-1 text-[10px] font-bold"
                    style={{ color: item.badgeColor }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Divider */}
      <div className="my-3 border-b border-[#2d2d48]" />

      {/* Changed Files Section */}
      <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
        Alterações · {changedFiles.length}
      </div>

      <div className="flex flex-col gap-0.5">
        {changedFiles.length === 0 ? (
          <p className="px-1 py-1 text-[11px] italic text-[#4b5563]">
            Sem alterações
          </p>
        ) : (
          changedFiles.map((file) => (
            <div
              key={file.name}
              onClick={() => onSelectFile?.(file.name)}
              className="flex items-center justify-between rounded-md px-1.5 py-1 text-[#b8bdd0] cursor-pointer hover:bg-[#282845] hover:text-white"
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                <span className="truncate">{file.name}</span>
              </div>
              <span
                className="text-[10px] font-bold"
                style={{ color: file.badgeColor }}
              >
                {file.badge}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

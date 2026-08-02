import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  RefreshCw,
  FolderInput,
} from "lucide-react";
import { useCodeStore } from "../../store/codeStore";
import type { DirEntry } from "../../lib/filesystem";

interface FileExplorerProps {
  onSelectFile?: (filename: string) => void;
}

export function FileExplorer({ onSelectFile }: FileExplorerProps) {
  const {
    projectPath,
    fileTree,
    openTabs,
    activeTabPath,
    changedFiles,
    openProject,
    refreshTree,
    openFile,
    createNewFile,
  } = useCodeStore();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleFileClick = (entry: DirEntry) => {
    if (entry.kind === "directory") {
      toggleFolder(entry.path);
    } else {
      openFile(entry.path);
      onSelectFile?.(entry.name);
    }
  };

  const handleCreateFileSubmit = async () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    setNewFileName("");
    setIsCreatingFile(false);
    await createNewFile(name);
  };

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-[#2d2d48] bg-[#20203a] p-3 shrink-0 overflow-y-auto text-xs select-none">
      {/* Top Header & Toolbar */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
          Explorador
        </span>

        {projectPath && (
          <div className="flex items-center gap-1 text-[#9ca3af]">
            <button
              type="button"
              onClick={() => setIsCreatingFile(!isCreatingFile)}
              className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-[#2c2c48]"
              title="Novo Arquivo"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => refreshTree()}
              className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-[#2c2c48]"
              title="Recarregar Árvore"
            >
              <RefreshCw className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => openProject()}
              className="p-1 hover:text-white transition-colors cursor-pointer rounded hover:bg-[#2c2c48]"
              title="Abrir Outro Projeto"
            >
              <FolderInput className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* New File Inline Input */}
      {isCreatingFile && (
        <div className="mb-2 px-1">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFileSubmit();
              if (e.key === "Escape") setIsCreatingFile(false);
            }}
            autoFocus
            placeholder="nome_do_arquivo.ext"
            className="w-full rounded border border-[#3b82f6] bg-[#14142a] px-2 py-1 text-xs text-white placeholder-[#6b7280] focus:outline-none"
          />
        </div>
      )}

      {/* File Tree List */}
      <div className="flex flex-col gap-0.5 min-h-[120px]">
        {!projectPath ? (
          <div className="flex flex-col gap-2 px-1 py-4 text-center">
            <p className="text-[11px] italic text-[#6b7280]">
              Nenhum projeto aberto
            </p>
            <button
              type="button"
              onClick={() => openProject()}
              className="rounded bg-[#3b82f6]/20 px-2.5 py-1.5 text-xs font-medium text-[#60a5fa] hover:bg-[#3b82f6]/30 transition-colors cursor-pointer"
            >
              Abrir Pasta...
            </button>
          </div>
        ) : fileTree.length === 0 ? (
          <p className="px-1 py-2 text-[11px] italic text-[#6b7280]">
            Diretório vazio
          </p>
        ) : (
          fileTree.map((entry) => {
            const isActive = activeTabPath === entry.path;
            const isOpenTab = openTabs.some((t) => t.path === entry.path);
            const indentLevel = (entry.path.match(/\//g) || []).length;
            const isDir = entry.kind === "directory";
            const isExpanded = expandedFolders[entry.path];

            return (
              <div
                key={entry.path}
                onClick={() => handleFileClick(entry)}
                style={{ paddingLeft: `${indentLevel * 12 + 6}px` }}
                className={`flex items-center justify-between rounded-md py-1 pr-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#2d2d4c] text-white font-medium"
                    : isOpenTab
                    ? "text-white hover:bg-[#282845]"
                    : "text-[#b8bdd0] hover:bg-[#282845] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isDir ? (
                    isExpanded ? (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                    )
                  ) : (
                    <FileCode className="h-3.5 w-3.5 shrink-0 text-[#60a5fa]" />
                  )}
                  <span className="truncate">{entry.name}</span>
                </div>
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
          <p className="px-1 py-1 text-[11px] italic text-[#6b7280]">
            Sem alterações
          </p>
        ) : (
          changedFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => openFile(file.path)}
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

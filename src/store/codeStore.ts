import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  listDirectory,
  readFile,
  writeFile,
  selectDirectory,
  type DirEntry,
} from "../lib/filesystem";
import { useFilesystemStore } from "./filesystemStore";

export interface CodeTab {
  id: string;
  path: string; // Relative to projectPath
  name: string; // Filename
  content: string;
  originalContent: string;
  isModified: boolean;
}

export interface ContextChip {
  id: string;
  name: string;
  path: string;
  content: string;
}

export interface ChangedFileItem {
  name: string;
  path: string;
  badge: "M" | "A" | "D";
  badgeColor: string;
}

interface CodeState {
  projectPath: string | null;
  projectName: string;
  branchName: string;
  fileTree: DirEntry[];
  openTabs: CodeTab[];
  activeTabPath: string | null;
  contextChips: ContextChip[];
  changedFiles: ChangedFileItem[];
  viewMode: "arquivo" | "diff";

  // Actions
  openProject: (dirPath?: string) => Promise<void>;
  refreshTree: () => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateTabContent: (path: string, content: string) => void;
  saveTab: (path: string) => Promise<void>;
  createNewFile: (relPath: string, content?: string) => Promise<void>;
  attachContextChip: (path: string) => Promise<void>;
  removeContextChip: (id: string) => void;
  setViewMode: (mode: "arquivo" | "diff") => void;
}

function getBasename(pathStr: string): string {
  const parts = pathStr.replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] || pathStr;
}

export const useCodeStore = create<CodeState>()(
  persist(
    (set, get) => ({
      projectPath: null,
      projectName: "—",
      branchName: "main",
      fileTree: [],
      openTabs: [],
      activeTabPath: null,
      contextChips: [],
      changedFiles: [],
      viewMode: "arquivo",

      openProject: async (dirPath?: string) => {
        let targetDir = dirPath;
        if (!targetDir) {
          try {
            targetDir = await selectDirectory();
          } catch {
            return;
          }
        }
        if (!targetDir) return;

        const name = getBasename(targetDir);
        set({
          projectPath: targetDir,
          projectName: name,
          openTabs: [],
          activeTabPath: null,
          changedFiles: [],
          contextChips: [],
        });

        // Also update workspace directory in filesystem store
        useFilesystemStore.getState().setWorkingDirectory(targetDir);

        try {
          const res = await listDirectory("", targetDir, 4);
          set({ fileTree: res.entries });
        } catch {
          set({ fileTree: [] });
        }
      },

      refreshTree: async () => {
        const { projectPath } = get();
        if (!projectPath) return;
        try {
          const res = await listDirectory("", projectPath, 4);
          set({ fileTree: res.entries });
        } catch {
          // Keep current tree
        }
      },

      openFile: async (relPath: string) => {
        const { projectPath, openTabs } = get();
        if (!projectPath || !relPath) return;

        const existing = openTabs.find((t) => t.path === relPath);
        if (existing) {
          set({ activeTabPath: relPath });
          return;
        }

        try {
          const fileContent = await readFile(relPath, projectPath);
          const newTab: CodeTab = {
            id: relPath,
            path: relPath,
            name: getBasename(relPath),
            content: fileContent,
            originalContent: fileContent,
            isModified: false,
          };
          set((state) => ({
            openTabs: [...state.openTabs, newTab],
            activeTabPath: relPath,
          }));
        } catch (err) {
          console.error(`Erro ao ler arquivo ${relPath}:`, err);
        }
      },

      closeTab: (path: string) => {
        set((state) => {
          const nextTabs = state.openTabs.filter((t) => t.path !== path);
          let nextActive = state.activeTabPath;
          if (state.activeTabPath === path) {
            nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].path : null;
          }
          return { openTabs: nextTabs, activeTabPath: nextActive };
        });
      },

      setActiveTab: (path: string) => set({ activeTabPath: path }),

      updateTabContent: (path: string, newContent: string) => {
        set((state) => {
          const updatedTabs = state.openTabs.map((tab) => {
            if (tab.path !== path) return tab;
            const isModified = newContent !== tab.originalContent;
            return { ...tab, content: newContent, isModified };
          });

          // Sync changedFiles list
          const modifiedTabs = updatedTabs.filter((t) => t.isModified);
          const changedItems: ChangedFileItem[] = modifiedTabs.map((t) => ({
            name: t.name,
            path: t.path,
            badge: "M",
            badgeColor: "#e06c75",
          }));

          return { openTabs: updatedTabs, changedFiles: changedItems };
        });
      },

      saveTab: async (path: string) => {
        const { projectPath, openTabs } = get();
        if (!projectPath) return;
        const tab = openTabs.find((t) => t.path === path);
        if (!tab) return;

        try {
          await writeFile(path, tab.content, projectPath);
          set((state) => {
            const updatedTabs = state.openTabs.map((t) =>
              t.path === path ? { ...t, originalContent: t.content, isModified: false } : t
            );
            const modifiedTabs = updatedTabs.filter((t) => t.isModified);
            const changedItems: ChangedFileItem[] = modifiedTabs.map((t) => ({
              name: t.name,
              path: t.path,
              badge: "M",
              badgeColor: "#e06c75",
            }));
            return { openTabs: updatedTabs, changedFiles: changedItems };
          });
          await get().refreshTree();
        } catch (err) {
          console.error(`Erro ao salvar arquivo ${path}:`, err);
        }
      },

      createNewFile: async (relPath: string, content = "") => {
        const { projectPath } = get();
        if (!projectPath) return;
        const cleanPath = relPath.replace(/^\.\//, "").replace(/^\//, "");
        if (!cleanPath) return;

        try {
          await writeFile(cleanPath, content, projectPath);
          await get().refreshTree();
          await get().openFile(cleanPath);
        } catch (err) {
          console.error(`Erro ao criar arquivo ${cleanPath}:`, err);
        }
      },

      attachContextChip: async (path: string) => {
        const { projectPath, contextChips } = get();
        if (!projectPath || !path) return;
        if (contextChips.some((c) => c.path === path)) return;

        try {
          const content = await readFile(path, projectPath);
          const newChip: ContextChip = {
            id: path,
            name: getBasename(path),
            path,
            content,
          };
          set((state) => ({ contextChips: [...state.contextChips, newChip] }));
        } catch {
          // Ignore read error
        }
      },

      removeContextChip: (id: string) => {
        set((state) => ({
          contextChips: state.contextChips.filter((c) => c.id !== id),
        }));
      },

      setViewMode: (mode: "arquivo" | "diff") => set({ viewMode: mode }),
    }),
    { name: "oc.code-store" },
  ),
);

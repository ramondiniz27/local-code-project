import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilesystemState {
  fsPermissionGranted: boolean;
  workingDirectory: string | null;
  setFsPermissionGranted: (granted: boolean) => void;
  setWorkingDirectory: (dir: string | null) => void;
}

export const useFilesystemStore = create<FilesystemState>()(
  persist(
    (set) => ({
      fsPermissionGranted: false,
      workingDirectory: null,
      setFsPermissionGranted: (granted) => set({ fsPermissionGranted: granted }),
      setWorkingDirectory: (dir) => set({ workingDirectory: dir }),
    }),
    { name: "oc.filesystem" },
  ),
);

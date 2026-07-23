import { create } from "zustand";
import { type FileEntry } from "@/lib/fs-access";

type FileOp = {
  action: "read" | "write" | "createDir" | "delete" | "rename";
  path: string;
  content?: string;
  newName?: string;
};

type OpenFile = {
  path: string;
  content: string | null;
};

type WorkspaceState = {
  rootHandle: FileSystemDirectoryHandle | null;
  rootName: string;
  fileTree: FileEntry[];
  expandedPaths: Set<string>;
  openFiles: OpenFile[];
  activeFilePath: string | null;
};

type WorkspaceActions = {
  setRoot: (handle: FileSystemDirectoryHandle, name: string) => void;
  clear: () => void;
  setFileTree: (tree: FileEntry[]) => void;
  toggleExpanded: (path: string) => void;
  setExpanded: (path: string, expanded: boolean) => void;
  openFile: (path: string, content: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
};

export const useWorkspace = create<WorkspaceState & WorkspaceActions>()((set) => ({
  rootHandle: null,
  rootName: "",
  fileTree: [],
  expandedPaths: new Set(),
  openFiles: [],
  activeFilePath: null,

  setRoot: (handle, name) =>
    set({ rootHandle: handle, rootName: name, fileTree: [], expandedPaths: new Set(), openFiles: [], activeFilePath: null }),

  clear: () =>
    set({ rootHandle: null, rootName: "", fileTree: [], expandedPaths: new Set(), openFiles: [], activeFilePath: null }),

  setFileTree: (tree) => set({ fileTree: tree }),

  toggleExpanded: (path) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return { expandedPaths: next };
    }),

  setExpanded: (path, expanded) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (expanded) next.add(path);
      else next.delete(path);
      return { expandedPaths: next };
    }),

  openFile: (path, content) =>
    set((s) => {
      const exists = s.openFiles.find((f) => f.path === path);
      if (exists) {
        return {
          openFiles: s.openFiles.map((f) => (f.path === path ? { ...f, content } : f)),
          activeFilePath: path,
        };
      }
      return {
        openFiles: [...s.openFiles, { path, content }],
        activeFilePath: path,
      };
    }),

  updateFileContent: (path, content) =>
    set((s) => ({
      openFiles: s.openFiles.map((f) => (f.path === path ? { ...f, content } : f)),
    })),

  closeFile: (path) =>
    set((s) => {
      const remaining = s.openFiles.filter((f) => f.path !== path);
      let active = s.activeFilePath;
      if (active === path) {
        const idx = s.openFiles.findIndex((f) => f.path === path);
        active = remaining[Math.min(idx, remaining.length - 1)]?.path ?? null;
      }
      return { openFiles: remaining, activeFilePath: active };
    }),

  setActiveFile: (path) => set({ activeFilePath: path }),
}));

export type { FileEntry, FileOp, OpenFile };

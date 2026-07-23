import { create } from "zustand";
import { type FileEntry } from "@/lib/fs-access";

type FileOp = {
  action: "read" | "write" | "createDir" | "delete" | "rename";
  path: string;
  content?: string;
  newName?: string;
};

type WorkspaceState = {
  rootHandle: FileSystemDirectoryHandle | null;
  rootName: string;
  fileTree: FileEntry[];
  expandedPaths: Set<string>;
  openFilePath: string | null;
  openFileContent: string | null;
};

type WorkspaceActions = {
  setRoot: (handle: FileSystemDirectoryHandle, name: string) => void;
  clear: () => void;
  setFileTree: (tree: FileEntry[]) => void;
  toggleExpanded: (path: string) => void;
  setExpanded: (path: string, expanded: boolean) => void;
  setOpenFile: (path: string | null, content: string | null) => void;
};

export const useWorkspace = create<WorkspaceState & WorkspaceActions>()((set) => ({
  rootHandle: null,
  rootName: "",
  fileTree: [],
  expandedPaths: new Set(),
  openFilePath: null,
  openFileContent: null,

  setRoot: (handle, name) =>
    set({ rootHandle: handle, rootName: name, fileTree: [], expandedPaths: new Set(), openFilePath: null, openFileContent: null }),

  clear: () =>
    set({ rootHandle: null, rootName: "", fileTree: [], expandedPaths: new Set(), openFilePath: null, openFileContent: null }),

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

  setOpenFile: (path, content) => set({ openFilePath: path, openFileContent: content }),
}));

export type { FileEntry, FileOp };

import { create } from "zustand";

type ProjectState = {
  rootHandle: FileSystemDirectoryHandle | null;
  rootName: string;
  setProject: (handle: FileSystemDirectoryHandle, name: string) => void;
  clearProject: () => void;
};

export const useProject = create<ProjectState>()((set) => ({
  rootHandle: null,
  rootName: "",
  setProject: (rootHandle, rootName) => set({ rootHandle, rootName }),
  clearProject: () => set({ rootHandle: null, rootName: "" }),
}));

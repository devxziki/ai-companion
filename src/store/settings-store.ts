import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export type Theme = "dark" | "light";

type SettingsState = {
  theme: Theme;
  sidebarOpen: boolean;
  selectedModel: string;
  language: string;
  sendOnEnter: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setModel: (m: string) => void;
  setLanguage: (l: string) => void;
  setSendOnEnter: (v: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarOpen: true,
      selectedModel: DEFAULT_MODEL_ID,
      language: "en",
      sendOnEnter: true,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setModel: (selectedModel) => set({ selectedModel }),
      setLanguage: (language) => set({ language }),
      setSendOnEnter: (sendOnEnter) => set({ sendOnEnter }),
    }),
    { name: "minicoder.settings.v1" },
  ),
);

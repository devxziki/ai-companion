import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { DEFAULT_APP_THEME } from "@/lib/app-themes";

export type Theme = string;

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

const THEME_CYCLE = ["one-dark-pro", "github-light", "dracula", "matrix", "monokai", "github-dark", "vs-dark"];

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: DEFAULT_APP_THEME,
      sidebarOpen: true,
      selectedModel: DEFAULT_MODEL_ID,
      language: "en",
      sendOnEnter: true,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => {
          const idx = THEME_CYCLE.indexOf(s.theme);
          const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
          return { theme: next };
        }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setModel: (selectedModel) => set({ selectedModel }),
      setLanguage: (language) => set({ language }),
      setSendOnEnter: (sendOnEnter) => set({ sendOnEnter }),
    }),
    {
      name: "minicoder.settings.v1",
      migrate: (persisted: any) => {
        if (persisted?.theme === "dark") return { ...persisted, theme: "one-dark-pro" };
        if (persisted?.theme === "light") return { ...persisted, theme: "github-light" };
        return persisted;
      },
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  selectedModule: string | null;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedModule: (module: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      selectedModule: null,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setSelectedModule: (selectedModule) => set({ selectedModule }),
    }),
    { name: "ui-storage" },
  ),
);

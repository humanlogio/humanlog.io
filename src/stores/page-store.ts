import { create } from "zustand";
import { persist } from "zustand/middleware";

type ActivePage = "query" | "stream" | "project" | "traces" | "settings";

interface PageStore {
  activePage: ActivePage | undefined;
  setActivePage: (page: ActivePage) => void;
  clearPage: () => void;
}

export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({
      activePage: "query",
      setActivePage: (page) => set({ activePage: page }),
      clearPage: () => set({ activePage: undefined }),
    }),
    {
      name: "page-storage",
    },
  ),
);

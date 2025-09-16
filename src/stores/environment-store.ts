import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";

interface EnvironmentStore {
  activeEnvironment: ListEnvironmentResponse_ListItem | undefined;
  setActiveEnvironment: (
    environment: ListEnvironmentResponse_ListItem | undefined,
  ) => void;
  clearEnvironment: () => void;
}

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set) => ({
      activeEnvironment: undefined,
      setActiveEnvironment: (environment) =>
        set({ activeEnvironment: environment }),
      clearEnvironment: () => set({ activeEnvironment: undefined }),
    }),
    {
      name: "environment-storage",
    },
  ),
);

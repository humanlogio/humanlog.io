import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { PingResponse } from "api/js/svc/localhost/v1/service_pb";

export type ActiveEnvironment =
  | { type: "localhost"; data: PingResponse }
  | { type: "hosted"; data: ListEnvironmentResponse_ListItem }
  | undefined;

interface EnvironmentStore {
  activeEnvironment: ActiveEnvironment;
  setActiveEnvironment: (environment: ActiveEnvironment) => void;
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

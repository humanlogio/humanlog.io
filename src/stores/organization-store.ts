import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizationStore {
  lastActiveOrgId: string | null;
  setLastActiveOrgId: (orgId: string) => void;
  clearLastActiveOrgId: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      lastActiveOrgId: null,
      setLastActiveOrgId: (orgId) => set({ lastActiveOrgId: orgId }),
      clearLastActiveOrgId: () => set({ lastActiveOrgId: null }),
    }),
    {
      name: "organization-storage",
    },
  ),
);

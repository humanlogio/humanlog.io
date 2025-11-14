import { Session, User } from "better-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  user: User | undefined;
  session: Session | undefined;
  setUser: (user: User | undefined) => void;
  setSession: (session: Session | undefined) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: undefined,
      session: undefined,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
    }),
    {
      name: "user-storage",
    },
  ),
);

interface Organization {
  id: bigint;
  name: string;
}

interface OrganizationStore {
  currentOrganization: Organization | undefined;
  defaultOrganization: Organization | undefined;
  setCurrentOrganization: (organization: Organization | undefined) => void;
  setDefaultOrganization: (organization: Organization | undefined) => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      currentOrganization: undefined,
      defaultOrganization: undefined,
      setCurrentOrganization: (organization) =>
        set({ currentOrganization: organization }),
      setDefaultOrganization: (organization) =>
        set({ defaultOrganization: organization }),
    }),
    {
      name: "organization-storage",
    },
  ),
);

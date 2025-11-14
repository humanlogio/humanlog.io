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

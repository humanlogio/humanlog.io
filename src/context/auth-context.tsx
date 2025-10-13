"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";

type AuthContextType = {
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  authMessage: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginRequiredPaths = ["/settings/*"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { userData } = useUser();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("You need to login.");
  const [previousPath, setPreviousPath] = useState<string>();

  const isLoginRequired = useCallback(
    (path: string) => {
      const pathOnly = path.split("?")[0];

      return loginRequiredPaths.some((pattern) => {
        if (!pattern.includes("*")) {
          return pattern === pathOnly;
        }

        if (pattern.endsWith("/*")) {
          const prefix = pattern.slice(0, -2);
          return pathOnly === prefix || pathOnly.startsWith(prefix + "/");
        }
        return false;
      });
    },
    [loginRequiredPaths],
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    if (
      previousPath &&
      previousPath !== pathname &&
      !isLoginRequired(previousPath)
    ) {
      router.push(previousPath);
    } else {
      router.push("/");
    }
  }, [pathname, router, isLoginRequired, previousPath, userData]);

  useEffect(() => {
    setPreviousPath(pathname);
  }, [pathname]);

  if (isLoginRequired(pathname) && !userData) {
    return (
      <div className="container flex h-[calc(100vh-260px)] flex-grow flex-col items-center justify-center gap-8">
        <Loader2 className="animate-spin" size={30}></Loader2>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthModalOpen,
        closeAuthModal,
        authMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

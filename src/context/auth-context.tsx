"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { getSelfURL } from "@/lib/envs";
import { usePathname, useRouter } from "next/navigation";
import { useAllEnvironments } from "@/context/list-environments";
import { Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApiClients } from "@/context/api-provider";

type AuthContextType = {
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  authMessage: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginRequiredPaths = [
  "/settings/*",
  "/user/*",
  "/env/*",
  "/org/*",
  "/localhost/*",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useApiClients();
  const { doLogin, user } = useAllEnvironments();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("You need to login.");
  const [previousPath, setPreviousPath] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

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
  }, [pathname, router, isLoginRequired, previousPath, authenticated]);

  const handleLogin = () => {
    setIsLoading(true);
    try {
      doLogin(`${getSelfURL()}${pathname}`);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPreviousPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (user === "loading" || isLoading) {
      return;
    }

    if (!authenticated && isLoginRequired(pathname)) {
      handleLogin();
    }
  }, [
    pathname,
    user,
    isLoginRequired,
    authenticated,
    isAuthModalOpen,
    isLoading,
  ]);

  if (isLoginRequired(pathname) && user === "loading") {
    return (
      <div className="container flex h-full flex-grow flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold">
          Verifying your identity...
        </h1>
        <Loader className="animate-spin"></Loader>
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

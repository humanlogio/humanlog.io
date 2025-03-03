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
import { Modal } from "@/components/ui/modal";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

type AuthContextType = {
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  authMessage: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginRequiredPaths = ["/settings/*", "/user/*", "/env/*", "/org/*"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { doLogin, user } = useAllEnvironments();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("You need to login.");

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
    if (isLoginRequired(pathname)) {
      router.back();
    }
  }, [pathname]);

  useEffect(() => {
    if (user === "not-logged-in" && isLoginRequired(pathname)) {
      setAuthMessage(`You need to login to access this page.`);
      setIsAuthModalOpen(true);
    }
  }, [pathname, user, isLoginRequired]);

  return (
    <AuthContext.Provider
      value={{
        isAuthModalOpen,
        closeAuthModal,
        authMessage,
      }}
    >
      {isAuthModalOpen ? (
        <>
          {user === "loading" ? (
            <div className="container flex h-full flex-grow flex-col items-center justify-center gap-8">
              <h1 className="text-center text-4xl font-bold">
                Verifying your identity...
              </h1>
              <Loader className="animate-spin"></Loader>
            </div>
          ) : (
            <Modal open={isAuthModalOpen}>
              <DialogHeader>
                <DialogTitle>{authMessage}</DialogTitle>
              </DialogHeader>
              <DialogFooter className="mt-4 flex-row">
                <Button
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    doLogin(`${getSelfURL()}${pathname}`);
                  }}
                >
                  Login
                </Button>
                <Button onClick={closeAuthModal}>Cancel</Button>
              </DialogFooter>
            </Modal>
          )}
        </>
      ) : (
        children
      )}
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

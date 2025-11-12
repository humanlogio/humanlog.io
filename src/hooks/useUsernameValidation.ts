import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { UsernameStatus } from "@/components/auth/username-status";

interface UseUsernameValidationOptions {
  username: string;
  debounceMs?: number;
  skipIfEmpty?: boolean;
  skipIfUnchanged?: string; // Compare with original username (used in user-settings)
}

export function useUsernameValidation({
  username,
  debounceMs = 500,
  skipIfEmpty = true,
  skipIfUnchanged,
}: UseUsernameValidationOptions) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    // Handle empty value
    if (!username) {
      if (skipIfEmpty) {
        setStatus("idle");
        return;
      }
    }

    // Skip if the username is unchanged (used in user-settings)
    if (skipIfUnchanged && username === skipIfUnchanged) {
      setStatus("idle");
      return;
    }

    if (username.length < 3) {
      setStatus("tooShort");
      return;
    }
    if (username.length > 39) {
      setStatus("tooLong");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      setStatus("invalidFormat");
      return;
    }

    setStatus("checking");

    const timer = setTimeout(async () => {
      await authClient.isUsernameAvailable(
        { username },
        {
          onSuccess: (res) => {
            setStatus(res.data.available ? "available" : "taken");
          },
          onError: () => {
            setStatus("error");
          },
        },
      );
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs, skipIfEmpty, skipIfUnchanged]);

  return { status, setStatus };
}

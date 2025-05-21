"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAllEnvironments } from "@/context/list-environments";
import { useApiClients } from "@/context/api-provider";
import { updateUser } from "@/services/userService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const OnboardingUsername = () => {
  const { apiClients } = useApiClients();
  const { user, doLogin } = useAllEnvironments();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "loading" || user === "not-logged-in" || !apiClients) return;
    setIsSubmitting(true);
    await updateUser(apiClients.user, user.firstName, user.lastName, username, {
      onSuccess: (res) => {
        if (res.user?.username) {
          toast.success("Username successfully updated");
          router.push("/onboarding?step=pricing");
          setIsSubmitting(false);
        }
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  useEffect(() => {
    if (user === "loading") return;
    if (user === "not-logged-in") {
      doLogin();
      return;
    }
    if (user?.username) router.push("/localhost");
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md dark:bg-black">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to HumanLog</h1>
          <p className="mt-2 text-gray-600">
            {"Let's get started with your account setup"}
          </p>
        </div>

        <form onSubmit={handleUpdateUser} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Please choose a username
            </label>
            <div className="mt-1">
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

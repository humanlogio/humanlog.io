"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { useMutation } from "@connectrpc/connect-query";
import { updateUser } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import LoadingIndicator from "@/components/loading-indicator";
import { useUser } from "@/hooks/useUser";

export const OnboardingUsername = () => {
  const [username, setUsername] = useState("");

  const router = useRouter();

  const { userData, isLoadingUser, refetchUser } = useUser();

  const { mutate: updateUserMutation, isPending } = useMutation(updateUser, {
    onSuccess: (res) => {
      if (res.user?.username) {
        toast.success("Username successfully updated");
        refetchUser();
        router.push("/onboarding?step=pricing");
      }
    },
    onError: () => {},
  });

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation({
      firstName: userData?.user?.firstName,
      lastName: userData?.user?.lastName,
      username,
    });
  };

  if (isLoadingUser) return <LoadingIndicator />;

  if (userData?.user?.username) {
    router.push("/onboarding?step=pricing");
    return;
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold dark:text-white">
          Welcome to HumanLog
        </h1>
        <p className="mt-2 text-gray-400">
          {"Let's get started with your account setup"}
        </p>
      </div>

      <form onSubmit={handleUpdateUser} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300"
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
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
};

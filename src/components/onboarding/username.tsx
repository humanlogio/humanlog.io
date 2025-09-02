"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAllEnvironments } from "@/context/list-environments";
import { useApiClients } from "@/context/api-provider";
import { updateUser } from "@/services/userService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

export const OnboardingUsername = () => {
  const { apiClients } = useApiClients();
  const { userInfo, doLogin, getUserInfo } = useAllEnvironments();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo || !apiClients) return;
    setIsSubmitting(true);
    await updateUser(
      apiClients.user,
      userInfo.user?.firstName,
      userInfo.user?.lastName,
      username,
      {
        onSuccess: (res) => {
          if (res.user?.username) {
            getUserInfo();
            toast.success("Username successfully updated");
            router.push("/onboarding?step=pricing");
            setIsSubmitting(false);
          }
        },
        onError: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  if (!userInfo?.user) {
    doLogin();
    return;
  }

  if (userInfo.user.username) {
    router.push("/localhost");
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
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
};

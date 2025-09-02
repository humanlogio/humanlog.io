"use client";

import { SettingsShell } from "@/components/settings-shell";
import { UserSettingsForm } from "@/components/user/user-settings-form";
import { useAllEnvironments } from "@/context/list-environments";
import { Loader } from "lucide-react";
import { useEffect } from "react";

export default function UserSettingsPage() {
  const { userInfo } = useAllEnvironments();

  if (!userInfo) {
    return (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        You need to login to access this page.
      </div>
    );
  }

  return (
    <SettingsShell activeSection="user">
      <h1 className="mb-6 text-3xl font-bold">User Settings</h1>
      <UserSettingsForm />
    </SettingsShell>
  );
}

"use client";

import LoadingIndicator from "@/components/loading-indicator";
import { UserSettingsForm } from "@/components/user/user-settings-form";
import { useAllEnvironments } from "@/context/list-environments";

export default function UserSettingsPage() {
  const { userInfo } = useAllEnvironments();

  if (!userInfo) {
    return (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        You need to login to access this page.
      </div>
    );
  }
  if (userInfo === "isLoading") {
    return <LoadingIndicator message="Loading user settings..." />;
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">User Settings</h1>
      <UserSettingsForm userInfo={userInfo} />
    </>
  );
}

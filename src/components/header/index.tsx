"use client";

import { useAllEnvironments } from "@/context/list-environments";
import { AppHeader } from "@/components/header/app-header";
import { PageHeader } from "@/components/header/page-header";

export const Header = () => {
  const { userInfo } = useAllEnvironments();

  return (
    <nav className="bg-muted flex h-12 w-full flex-col justify-center">
      <div className="sticky top-0 z-20">
        {userInfo === "isLoading" ? null : userInfo ? (
          <AppHeader userInfo={userInfo} />
        ) : (
          <PageHeader />
        )}
      </div>
    </nav>
  );
};

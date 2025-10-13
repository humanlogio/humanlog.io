"use client";

import { AppHeader } from "@/components/header/app-header";
import { PageHeader } from "@/components/header/page-header";
import { useUser } from "@/hooks/useUser";

export const Header = () => {
  const { userData, isLoadingUser } = useUser();

  if (isLoadingUser) return <></>;

  return (
    <nav className="bg-muted fixed top-0 z-20 flex h-12 w-full flex-col justify-center">
      {userData ? <AppHeader /> : <PageHeader />}
    </nav>
  );
};

"use client";

import { useEffect } from "react";
import { usePageStore } from "@/stores/page-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePage, setActivePage } = usePageStore();

  useEffect(() => {
    setActivePage("project");
  }, [activePage]);

  return <>{children}</>;
}

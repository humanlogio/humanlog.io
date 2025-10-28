"use client";

import { useEffect } from "react";
import { usePage } from "@/stores/page-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePage, setActivePage } = usePage();

  useEffect(() => {
    setActivePage("project");
  }, [activePage]);

  return <>{children}</>;
}

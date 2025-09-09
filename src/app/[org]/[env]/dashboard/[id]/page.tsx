"use client";

import dynamic from "next/dynamic";
import LoadingIndicator from "@/components/loading-indicator";
import { use } from "react";

// Dynamically import DashboardClient to avoid SSR issues with Perses dashboard store
const DashboardClient = dynamic(
  () =>
    import("@/app/[org]/[env]/dashboard/[id]/DashboardClient").then((mod) => ({
      default: mod.DashboardClient,
    })),
  {
    ssr: false,
    loading: () => <LoadingIndicator message="Loading dashboard..." />,
  },
);

export default function Dashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <DashboardClient dashboardId={id} />;
}

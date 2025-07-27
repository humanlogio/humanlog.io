"use client";

import dynamic from "next/dynamic";
import LoadingIndicator from "@/components/loading-indicator";
import { use } from "react";

// Dynamically import DashboardClient to avoid SSR issues with Perses dashboard store
const DashboardClient = dynamic(
  () =>
    import("@/app/localhost/dashboard/[id]/DashboardClient").then((mod) => ({
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
  params: Promise<{ stackName: string; id: string }>;
}) {
  const { stackName, id } = use(params);

  return <DashboardClient stackName={stackName} dashboardId={id} />;
}

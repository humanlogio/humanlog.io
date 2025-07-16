import { DashboardClient } from "@/app/localhost/dashboard/[id]/DashboardClient";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DashboardClient dashboardId={id} />;
}

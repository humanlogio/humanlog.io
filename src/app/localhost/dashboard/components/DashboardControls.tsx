import { useDashboardPersistence } from "@/lib/hooks/useDashboardPersistence";
import { DashboardResource } from "@perses-dev/core";
import { Button } from "@/components/ui/button";

interface DashboardControlsProps {
  dashboardResource: DashboardResource;
}

// Dashboard controls component
export function DashboardControls({
  dashboardResource,
}: DashboardControlsProps) {
  const { hasChanges, changeLog, saveDashboard } =
    useDashboardPersistence(dashboardResource);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button
        onClick={saveDashboard}
        disabled={!hasChanges}
        variant={hasChanges ? "default" : "secondary"}
      >
        Save
      </Button>
    </div>
  );
}

import { useDashboardPersistence } from "@/lib/hooks/useDashboardPersistence";
import { DashboardResource } from "@perses-dev/core";
import { Button } from "@/components/ui/button";
import { updateDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useMutation } from "@connectrpc/connect-query";
import { toast } from "sonner";
import { logger } from "@/lib/utils/telemetry/logger";

interface DashboardControlsProps {
  dashboardResource: DashboardResource;
  dashboardId: string;
}

// Dashboard controls component
export function DashboardControls({
  dashboardResource,
  dashboardId,
}: DashboardControlsProps) {
  const { mutate: updateDashboardMutation, isPending: isUpdating } =
    useMutation(updateDashboard);

  const { hasChanges, changeLog, prepareDashboardForSave } =
    useDashboardPersistence(dashboardResource, dashboardId);

  const handleSave = async () => {
    try {
      const { updateRequest, dashboard, changes } = prepareDashboardForSave();

      console.log("updateRequest", updateRequest);
      updateDashboardMutation(updateRequest, {
        onSuccess: (response) => {
          toast.success("Dashboard saved successfully");
          logger.info("Dashboard saved successfully", {
            dashboardId: dashboard.metadata.name,
          });
          console.log("Dashboard update response:", response);
        },
        onError: (error) => {
          toast.error(`Failed to save dashboard: ${error.message}`);
          logger.error("Failed to save dashboard", {
            error: error instanceof Error ? error.message : String(error),
            dashboardId: dashboard.metadata.name,
          });
          console.error("Dashboard update error:", error);
        },
      });
    } catch (error) {
      toast.error(`Failed to prepare dashboard for saving: ${error}`);
      logger.error("Failed to prepare dashboard for saving", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isUpdating}
        variant={hasChanges ? "default" : "secondary"}
      >
        {isUpdating ? "Saving..." : "Save"}
      </Button>
      {/* {hasChanges && (
        <span className="text-sm text-gray-500">
          {changeLog.length} unsaved change{changeLog.length !== 1 ? "s" : ""}
        </span>
      )} */}
    </div>
  );
}

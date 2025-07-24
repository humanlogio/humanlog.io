import { useDashboardPersistence } from "@/lib/hooks/useDashboardPersistence";
import { DashboardResource } from "@perses-dev/core";
import { Button } from "@/components/ui/button";
import { updateDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useMutation } from "@connectrpc/connect-query";
import { toast } from "sonner";
import { logger } from "@/lib/utils/telemetry/logger";
import { useEffect } from "react";

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

  let hookResult;
  try {
    hookResult = useDashboardPersistence(dashboardResource, dashboardId);
    console.log("useDashboardPersistence result:", hookResult);
  } catch (error) {
    console.error("Error in useDashboardPersistence:", error);
    // Provide default values when error occurs
    hookResult = {
      hasChanges: false,
      changeLog: [],
      prepareDashboardForSave: () => ({
        updateRequest: null,
        dashboard: dashboardResource,
        changes: [],
        lastModified: new Date().toISOString(),
        hasChanges: false,
      }),
    };
  }

  const { hasChanges, changeLog, prepareDashboardForSave } = hookResult;

  // Check component state on mount
  useEffect(() => {
    console.log("DashboardControls mounted with:", {
      dashboardResource,
      dashboardId,
      hasChanges,
      changeLogLength: changeLog?.length || 0,
    });
  }, [dashboardResource, dashboardId, hasChanges, changeLog]);

  const handleSave = async () => {
    try {
      console.log("Save button clicked");
      const { updateRequest, dashboard, changes } = prepareDashboardForSave();

      if (!updateRequest) {
        console.warn("No update request prepared");
        return;
      }

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
      console.error("Handle save error:", error);
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
          {changeLog?.length || 0} unsaved change
          {(changeLog?.length || 0) !== 1 ? "s" : ""}
        </span>
      )} */}
    </div>
  );
}

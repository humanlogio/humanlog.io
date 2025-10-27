import { useDashboardPersistence } from "@/lib/hooks/useDashboardPersistence";
import { DashboardResource } from "@perses-dev/core";
import { Button } from "@/components/ui/button";
import {
  deleteDashboard,
  updateDashboard,
} from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useMutation } from "@connectrpc/connect-query";
import { toast } from "sonner";
import { logger } from "@/lib/utils/telemetry/logger";
import { useEffect } from "react";
import { useActiveTransport } from "@/context/api-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { DeleteDashboardRequestSchema } from "api/js/svc/dashboard/v1/service_pb";
import { create } from "@bufbuild/protobuf";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useUser } from "@/hooks/useUser";
import { useEnvironmentStore } from "@/stores/environment-store";
import { Loader2 } from "lucide-react";

interface DashboardControlsProps {
  dashboardResource: DashboardResource;
  dashboardId: string;
}

// Dashboard controls component
export function DashboardControls({
  dashboardResource,
  dashboardId,
}: DashboardControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get("projectName") as string;

  const { userData } = useUser();
  const { activeEnvironment } = useEnvironmentStore();

  const { mutate: updateDashboardMutation, isPending: isUpdating } =
    useMutation(updateDashboard, {
      transport: useActiveTransport(),
    });

  const { mutate: deleteDashboardMutation, isPending: isDeleting } =
    useMutation(deleteDashboard, {
      transport: useActiveTransport(),
    });

  const hookResult = useDashboardPersistence(
    dashboardResource,
    dashboardId,
    projectName,
  );

  //add debug logs
  useEffect(() => {
    try {
      console.log("useDashboardPersistence result:", hookResult);
    } catch (error) {
      console.error("Error logging hook result:", error);
    }
  }, [hookResult]);

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

      if (!prepareDashboardForSave) {
        console.warn("prepareDashboardForSave function not available");
        return;
      }

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

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this dashboard?"))
      return;
    const deleteRequest = create(DeleteDashboardRequestSchema, {
      id: dashboardId,
      projectName,
    });
    deleteDashboardMutation(deleteRequest, {
      onSuccess: (res) => {
        toast.success(`Dashboard  deleted successfully`);
        router.replace(getOrgEnvUrl(userData, activeEnvironment, "project"));
      },
      onError: (error) => {
        toast.error(`Failed to delete dashboard: ${error.message}`);
        logger.error("Failed to delete dashboard", {
          error: error instanceof Error ? error.message : String(error),
        });
      },
    });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button
        onClick={handleDelete}
        disabled={!hasChanges || isDeleting}
        variant="destructive"
        className="w-20"
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
      </Button>
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isUpdating}
        variant={hasChanges ? "default" : "secondary"}
        className="w-20"
      >
        {isUpdating ? <Loader2 className="animate-spin" /> : "Save"}
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

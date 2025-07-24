import { useCallback, useEffect, useState } from "react";
import { useDashboardStore } from "@perses-dev/dashboards";
import { DashboardResource } from "@perses-dev/core";
import {
  UpdateDashboardRequest_Mutation,
  UpdateDashboardRequest,
} from "api/js/svc/dashboard/v1/service_pb";

// Dashboard changes tracking for backend API integration
export interface DashboardChanges {
  dashboardResource: DashboardResource;
  hasChanges: boolean;
  lastModified: string;
  changeLog: Array<{
    timestamp: string;
    type:
      | "panel_added"
      | "panel_deleted"
      | "panel_moved"
      | "panel_resized"
      | "panel_edited"
      | "layout_changed";
    details: any;
  }>;
}

// Custom hook to track dashboard state and prepare data for backend API calls
export function useDashboardPersistence(
  initialDashboard: DashboardResource,
  dashboardId: string,
) {
  const [dashboardChanges, setDashboardChanges] = useState<DashboardChanges>({
    dashboardResource: initialDashboard,
    hasChanges: false,
    lastModified: new Date().toISOString(),
    changeLog: [],
  });

  // Get current dashboard state
  const getCurrentDashboardState = useDashboardStore((state) => {
    console.log("state", state);
    // Reconstruct DashboardResource from current state
    const currentDashboard: DashboardResource = {
      kind: state.kind as "Dashboard",
      metadata: state.metadata,
      spec: {
        display: state.display,
        datasources: state.datasources || {},
        duration: state.duration,
        refreshInterval: state.refreshInterval,
        variables: [], // Variables are managed separately, so set as empty array
        panels: state.panels || {},
        layouts: state.panelGroups
          ? Object.values(state.panelGroups).map((group) => ({
              kind: "Grid" as const,
              spec: {
                display: {
                  title: group.title || "Panel Group",
                  collapse: { open: !group.isCollapsed },
                },
                items: group.itemLayouts.map((layout) => {
                  // Find panel key corresponding to layout.i from itemPanelKeys
                  const panelKey = group.itemPanelKeys[layout.i];
                  return {
                    x: layout.x,
                    y: layout.y,
                    width: layout.w,
                    height: layout.h,
                    content: {
                      $ref: `#/spec/panels/${panelKey}`,
                    },
                  };
                }),
              },
            }))
          : [],
      },
    };
    return currentDashboard;
  });

  // Detect changes and log them
  useEffect(() => {
    const currentState = getCurrentDashboardState;
    const previousState = dashboardChanges.dashboardResource;

    // Check if there are any changes
    const hasStateChanged =
      JSON.stringify(currentState) !== JSON.stringify(previousState);

    if (hasStateChanged) {
      const timestamp = new Date().toISOString();

      // Analyze changes
      const newChangeLog = [...dashboardChanges.changeLog];

      // Check panel changes
      const currentPanels = currentState.spec.panels || {};
      const previousPanels = previousState.spec.panels || {};

      // Check for new panel additions
      for (const panelKey in currentPanels) {
        if (!previousPanels[panelKey]) {
          newChangeLog.push({
            timestamp,
            type: "panel_added",
            details: { panelKey, panel: currentPanels[panelKey] },
          });
        }
      }

      // Check for panel deletions
      for (const panelKey in previousPanels) {
        if (!currentPanels[panelKey]) {
          newChangeLog.push({
            timestamp,
            type: "panel_deleted",
            details: { panelKey },
          });
        }
      }

      // Check layout changes
      const currentLayouts = currentState.spec.layouts || [];
      const previousLayouts = previousState.spec.layouts || [];

      if (JSON.stringify(currentLayouts) !== JSON.stringify(previousLayouts)) {
        newChangeLog.push({
          timestamp,
          type: "layout_changed",
          details: {
            currentLayouts,
            previousLayouts,
          },
        });
      }

      setDashboardChanges({
        dashboardResource: currentState,
        hasChanges: true,
        lastModified: timestamp,
        changeLog: newChangeLog,
      });
    }
  }, [getCurrentDashboardState, dashboardChanges.dashboardResource]);

  const prepareDashboardForSave = useCallback(() => {
    const currentDashboard = dashboardChanges.dashboardResource;

    console.log("Current dashboard:", currentDashboard);

    // Serialize the entire dashboard to JSON for setPersesJson
    const persesJsonString = JSON.stringify(currentDashboard);
    const persesJsonBytes = new TextEncoder().encode(persesJsonString);

    // Create UpdateDashboardRequest
    const updateRequest = new UpdateDashboardRequest({
      id: dashboardId,
      mutations: [
        new UpdateDashboardRequest_Mutation({
          do: {
            case: "setPersesJson",
            value: persesJsonBytes,
          },
        }),
      ],
    });

    return {
      updateRequest,
      dashboard: currentDashboard,
      changes: dashboardChanges.changeLog,
      lastModified: dashboardChanges.lastModified,
      hasChanges: dashboardChanges.hasChanges,
    };
  }, [dashboardChanges, dashboardId]);

  const saveDashboard = useCallback(async () => {
    const dataToSave = prepareDashboardForSave();

    console.log("Dashboard update request ready for backend API:", {
      updateRequest: dataToSave.updateRequest,
      dashboard: dataToSave.dashboard,
      changes: dataToSave.changes,
    });

    // Reset changes after saving
    setDashboardChanges((prev) => ({
      ...prev,
      hasChanges: false,
      changeLog: [],
    }));

    return { success: true };
  }, [prepareDashboardForSave]);

  return {
    hasChanges: dashboardChanges.hasChanges,
    changeLog: dashboardChanges.changeLog,
    saveDashboard,
    prepareDashboardForSave,
    getCurrentDashboard: getCurrentDashboardState,
  };
}

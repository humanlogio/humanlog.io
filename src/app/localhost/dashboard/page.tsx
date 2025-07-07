"use client";

import { ThemeProvider } from "@mui/material";
import {
  ChartsProvider,
  generateChartsTheme,
  getTheme,
  SnackbarProvider,
} from "@perses-dev/components";
import {
  DatasourceStoreProvider,
  VariableProvider,
  DatasourceApi,
  Dashboard,
  DashboardProvider,
  PanelDrawer,
  EditJsonDialog,
  DeletePanelDialog,
  DeletePanelGroupDialog,
  SaveChangesConfirmationDialog,
  PanelGroupDialog,
  useDashboardStore,
} from "@perses-dev/dashboards";
import {
  dynamicImportPluginLoader,
  PluginRegistry,
  TimeRangeProvider,
  ValidationProvider,
} from "@perses-dev/plugin-system";
import * as prometheusPlugin from "@perses-dev/prometheus-plugin";
import * as timeseriesChartPlugin from "@perses-dev/timeseries-chart-plugin";
import {
  DashboardResource,
  GlobalDatasourceResource,
  DatasourceResource,
  PanelDefinition,
  LayoutDefinition,
} from "@perses-dev/core";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

const fakeDatasource: GlobalDatasourceResource = {
  kind: "GlobalDatasource",
  metadata: { name: "prometheus" },
  spec: {
    default: true,
    plugin: {
      kind: "PrometheusDatasource",
      spec: {
        directUrl: "http://localhost:9090",
      },
    },
  },
};

class DatasourceApiImpl implements DatasourceApi {
  getDatasource(): Promise<DatasourceResource | undefined> {
    return Promise.resolve(undefined);
  }

  getGlobalDatasource(): Promise<GlobalDatasourceResource | undefined> {
    return Promise.resolve(fakeDatasource);
  }

  listDatasources(): Promise<DatasourceResource[]> {
    return Promise.resolve([]);
  }

  listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return Promise.resolve([fakeDatasource]);
  }

  buildProxyUrl(): string {
    return "/prometheus";
  }
}

export const fakeDatasourceApi = new DatasourceApiImpl();

const dashboardResource: DashboardResource = {
  kind: "Dashboard",
  metadata: {
    name: "monitoring-dashboard",
    project: "default",
  },
  spec: {
    display: {
      name: "Monitoring Dashboard",
      description:
        "System monitoring dashboard with memory, status, and CPU metrics",
    },
    datasources: {
      prometheus: {
        default: true,
        plugin: {
          kind: "PrometheusDatasource",
          spec: {
            directUrl: "http://localhost:9090",
          },
        },
      },
    },
    duration: "1h",
    refreshInterval: "30s",
    variables: [],
    panels: {
      "memory-panel": {
        kind: "Panel",
        spec: {
          display: {
            name: "Memory Usage",
            description: "Go memory allocation in bytes",
          },
          plugin: {
            kind: "TimeSeriesChart",
            spec: {
              legend: {
                position: "bottom",
                size: "small",
              },
              yAxis: {
                show: true,
                label: "Bytes",
              },
            },
          },
          queries: [
            {
              kind: "PrometheusTimeSeriesQuery",
              spec: {
                plugin: {
                  kind: "PrometheusTimeSeriesQuery",
                  spec: {
                    query: "go_memstats_alloc_bytes",
                    datasource: {
                      kind: "PrometheusDatasource",
                      name: "prometheus",
                    },
                  },
                },
              },
            },
          ],
        },
      },
      "status-panel": {
        kind: "Panel",
        spec: {
          display: {
            name: "Service Status",
            description: "Service availability status",
          },
          plugin: {
            kind: "TimeSeriesChart",
            spec: {
              legend: {
                position: "bottom",
                size: "small",
              },
              yAxis: {
                show: true,
                label: "Status",
              },
            },
          },
          queries: [
            {
              kind: "PrometheusTimeSeriesQuery",
              spec: {
                plugin: {
                  kind: "PrometheusTimeSeriesQuery",
                  spec: {
                    query: "up",
                    datasource: {
                      kind: "PrometheusDatasource",
                      name: "prometheus",
                    },
                  },
                },
              },
            },
          ],
        },
      },
      "cpu-panel": {
        kind: "Panel",
        spec: {
          display: {
            name: "CPU Usage",
            description: "CPU garbage collection duration rate",
          },
          plugin: {
            kind: "TimeSeriesChart",
            spec: {
              legend: {
                position: "bottom",
                size: "small",
              },
              yAxis: {
                show: true,
                label: "Rate",
              },
            },
          },
          queries: [
            {
              kind: "PrometheusTimeSeriesQuery",
              spec: {
                plugin: {
                  kind: "PrometheusTimeSeriesQuery",
                  spec: {
                    query: "rate(go_gc_duration_seconds_sum[5m])",
                    datasource: {
                      kind: "PrometheusDatasource",
                      name: "prometheus",
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
    layouts: [
      {
        kind: "Grid",
        spec: {
          display: {
            title: "System Metrics",
            collapse: {
              open: true,
            },
          },
          items: [
            {
              x: 0,
              y: 0,
              width: 12,
              height: 8,
              content: {
                $ref: "#/spec/panels/memory-panel",
              },
            },
            {
              x: 0,
              y: 8,
              width: 12,
              height: 8,
              content: {
                $ref: "#/spec/panels/status-panel",
              },
            },
            {
              x: 0,
              y: 16,
              width: 12,
              height: 8,
              content: {
                $ref: "#/spec/panels/cpu-panel",
              },
            },
          ],
        },
      },
    ],
  },
};

interface DashboardChanges {
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
function useDashboardPersistence() {
  const [dashboardChanges, setDashboardChanges] = useState<DashboardChanges>({
    dashboardResource: dashboardResource,
    hasChanges: false,
    lastModified: new Date().toISOString(),
    changeLog: [],
  });

  // Get current dashboard state
  const getCurrentDashboardState = useDashboardStore(
    useCallback((state) => {
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
    }, []),
  );

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
    return {
      dashboard: dashboardChanges.dashboardResource,
      changes: dashboardChanges.changeLog,
      lastModified: dashboardChanges.lastModified,
      hasChanges: dashboardChanges.hasChanges,
    };
  }, [dashboardChanges]);

  const saveDashboard = useCallback(async () => {
    const dataToSave = prepareDashboardForSave();

    console.log("Dashboard data ready for backend API:", dataToSave);

    // TODO: Fetch API

    alert(
      `Dashboard changes saved to console. Check browser console for details.`,
    );

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

// Dashboard controls component
function DashboardControls() {
  const { hasChanges, changeLog, saveDashboard } = useDashboardPersistence();

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={saveDashboard}
        disabled={!hasChanges}
        style={{
          padding: "8px 16px",
          backgroundColor: hasChanges ? "#1976d2" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: hasChanges ? "pointer" : "not-allowed",
        }}
      >
        Save Dashboard
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();

  const themeMode = theme === "dark" ? "dark" : "light";
  const muiTheme = getTheme(themeMode);
  const chartsTheme = generateChartsTheme(muiTheme, {});

  const pluginLoader = dynamicImportPluginLoader([
    {
      resource: prometheusPlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(prometheusPlugin),
    },
    {
      resource: timeseriesChartPlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(timeseriesChartPlugin),
    },
  ]);

  return (
    <ThemeProvider theme={muiTheme}>
      <ChartsProvider chartsTheme={chartsTheme}>
        <SnackbarProvider
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="default"
          content=""
        >
          <PluginRegistry
            pluginLoader={pluginLoader}
            defaultPluginKinds={{
              Panel: "TimeSeriesChart",
              TimeSeriesQuery: "PrometheusTimeSeriesQuery",
            }}
          >
            <TimeRangeProvider
              refreshInterval="30s"
              timeRange={{ pastDuration: "1h" }}
            >
              <VariableProvider>
                <DatasourceStoreProvider
                  dashboardResource={dashboardResource}
                  datasourceApi={fakeDatasourceApi}
                >
                  <ValidationProvider>
                    <DashboardProvider
                      initialState={{
                        dashboardResource,
                        isEditMode: true,
                      }}
                    >
                      <div
                        style={{
                          padding: "24px",
                          minHeight: "100vh",
                          backgroundColor:
                            theme === "dark" ? "#121212" : "#ffffff",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                        }}
                      >
                        <h1
                          style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginBottom: "24px",
                          }}
                        >
                          Dashboard
                        </h1>

                        <DashboardControls />

                        <Dashboard
                          panelOptions={{
                            hideHeader: false,
                          }}
                        />

                        {/* Panel editing dialogs */}
                        <PanelDrawer />
                        <EditJsonDialog isReadonly={false} />
                        <DeletePanelDialog />
                        <DeletePanelGroupDialog />
                        <SaveChangesConfirmationDialog />
                        <PanelGroupDialog />
                      </div>
                    </DashboardProvider>
                  </ValidationProvider>
                </DatasourceStoreProvider>
              </VariableProvider>
            </TimeRangeProvider>
          </PluginRegistry>
        </SnackbarProvider>
      </ChartsProvider>
    </ThemeProvider>
  );
}

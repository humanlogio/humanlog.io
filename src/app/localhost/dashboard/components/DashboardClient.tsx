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
  Dashboard,
  DashboardProvider,
  PanelDrawer,
  EditJsonDialog,
  DeletePanelDialog,
  DeletePanelGroupDialog,
  SaveChangesConfirmationDialog,
  PanelGroupDialog,
} from "@perses-dev/dashboards";
import {
  dynamicImportPluginLoader,
  PluginRegistry,
  TimeRangeProvider,
  ValidationProvider,
} from "@perses-dev/plugin-system";
import * as prometheusPlugin from "@perses-dev/prometheus-plugin";
import * as timeseriesChartPlugin from "@perses-dev/timeseries-chart-plugin";
import * as barchartPlugin from "@perses-dev/bar-chart-plugin";
import { useTheme } from "next-themes";

import { mockDatasourceApi, mockDashboard } from "@/lib/mocks/sampleDashboards";
import { DashboardControls } from "@/app/localhost/dashboard/components/DashboardControls";
import { useMemo } from "react";
import { getDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useQuery } from "@connectrpc/connect-query";
import { DashboardResource } from "@perses-dev/core";

// Helper function to decode persesJson bytes back to DashboardResource
function decodePersesJson(
  persesJsonBytes: Uint8Array | undefined,
): DashboardResource | null {
  if (!persesJsonBytes) return null;

  try {
    const jsonString = new TextDecoder().decode(persesJsonBytes);
    return JSON.parse(jsonString) as DashboardResource;
  } catch (error) {
    console.error("Failed to decode persesJson:", error);
    return null;
  }
}

interface DashboardClientProps {
  dashboardId: string;
}

export function DashboardClient({ dashboardId }: DashboardClientProps) {
  const { theme } = useTheme();
  const { isLoading, data } = useQuery(getDashboard, { id: dashboardId });

  console.log("data", data);

  // Decode the persesJson bytes back to DashboardResource
  const decodedDashboard = useMemo(() => {
    return decodePersesJson(data?.dashboard?.persesJson);
  }, [data?.dashboard?.persesJson]);

  const themeMode = useMemo(() => {
    switch (theme) {
      case "dark":
        return "dark";
      case "light":
        return "light";
      case "system":
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      default:
        return "light";
    }
  }, [theme]);

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
    {
      resource: barchartPlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(barchartPlugin),
    },
  ]);

  if (isLoading) return <div>Loading...</div>;

  if (!decodedDashboard) return <div>Dashboard not found</div>;

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
                  dashboardResource={decodedDashboard}
                  datasourceApi={mockDatasourceApi}
                >
                  <ValidationProvider>
                    <DashboardProvider
                      initialState={{
                        dashboardResource: decodedDashboard,
                        isEditMode: true,
                      }}
                    >
                      <div className="min-h-screen bg-white p-6 text-black dark:bg-gray-900 dark:text-white">
                        <div className="flex items-center justify-between">
                          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
                          <DashboardControls
                            dashboardResource={decodedDashboard}
                            dashboardId={dashboardId}
                          />
                        </div>

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

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
import { useTheme } from "next-themes";
import { DashboardControls } from "@/app/localhost/dashboard/components/DashboardControls";
import { useMemo, useState, useEffect } from "react";
import { getDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useQuery } from "@connectrpc/connect-query";
import { DashboardResource } from "@perses-dev/core";
import { mockDatasourceApi } from "@/lib/mocks/sampleDashboards";
import LoadingIndicator from "@/components/loading-indicator";

// Helper function to decode persesJson bytes back to DashboardResource
function decodePersesJson(
  persesJsonBytes: Uint8Array | undefined,
): DashboardResource | null {
  if (!persesJsonBytes) return null;

  try {
    const jsonString = new TextDecoder().decode(persesJsonBytes);
    return JSON.parse(jsonString) as DashboardResource;
  } catch (error) {
    return null;
  }
}

interface DashboardClientProps {
  dashboardId: string;
}

export function DashboardClient({ dashboardId }: DashboardClientProps) {
  const { theme } = useTheme();
  const { isLoading, data } = useQuery(getDashboard, { id: dashboardId });
  const [plugins, setPlugins] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadPlugins = async () => {
      try {
        const [
          humanlogPlugin,
          prometheusPlugin,
          timeseriesChartPlugin,
          barchartPlugin,
        ] = await Promise.all([
          import("@humanlogio/perses-plugin"),
          import("@perses-dev/prometheus-plugin"),
          import("@perses-dev/timeseries-chart-plugin"),
          import("@perses-dev/bar-chart-plugin"),
        ]);

        setPlugins({
          humanlogPlugin,
          prometheusPlugin,
          timeseriesChartPlugin,
          barchartPlugin,
        });
      } catch (error) {
        console.error("Failed to load plugins:", error);
      }
    };

    loadPlugins();
  }, [isClient]);

  // Decode the persesJson bytes back to DashboardResource
  const decodedDashboard = useMemo(() => {
    const dashboard = decodePersesJson(data?.dashboard?.persesJson);

    if (dashboard) {
      // Initialize datasources object if it doesn't exist
      if (!dashboard.spec.datasources) {
        dashboard.spec.datasources = {};
      }

      // Add both local and hosted Humanlog datasources if they don't exist
      if (!dashboard.spec.datasources["humanlog-localhost"]) {
        dashboard.spec.datasources["humanlog-localhost"] = {
          default: true, // Default for local development
          plugin: {
            kind: "HumanlogDatasource",
            spec: {
              directUrl: "http://localhost:32764",
            },
          },
        };
      }

      // TODO
      // if (!dashboard.spec.datasources["humanlog-hosted"]) {
      //   dashboard.spec.datasources["humanlog-hosted"] = {
      //     default: false,
      //     plugin: {
      //       kind: "HumanlogDatasource",
      //       spec: {
      //         directUrl:
      //           process.env.NEXT_PUBLIC_HUMANLOG_API_URL ||
      //           "https://api.humanlog.io",
      //       },
      //     },
      //   };
      // }

      // For backward compatibility with any existing "humanlog" datasource references
      if (!dashboard.spec.datasources["humanlog"]) {
        dashboard.spec.datasources["humanlog"] = {
          default: false,
          plugin: {
            kind: "HumanlogDatasource",
            spec: {
              directUrl: "http://localhost:32764",
            },
          },
        };
      }
    }

    return dashboard;
  }, [data?.dashboard?.persesJson]);

  const themeMode = useMemo(() => {
    if (!isClient) return "light"; // Server-side fallback

    switch (theme) {
      case "dark":
        return "dark";
      case "light":
        return "light";
      case "system":
        return window?.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      default:
        return "light";
    }
  }, [theme, isClient]);

  const muiTheme = getTheme(themeMode);
  const chartsTheme = generateChartsTheme(muiTheme, {});

  const pluginLoader = useMemo(() => {
    if (!plugins) return null;

    return dynamicImportPluginLoader([
      {
        resource: plugins.humanlogPlugin.getPluginModule(),
        importPlugin: () => Promise.resolve(plugins.humanlogPlugin),
      },
      {
        resource: plugins.prometheusPlugin.getPluginModule(),
        importPlugin: () => Promise.resolve(plugins.prometheusPlugin),
      },
      {
        resource: plugins.timeseriesChartPlugin.getPluginModule(),
        importPlugin: () => Promise.resolve(plugins.timeseriesChartPlugin),
      },
      {
        resource: plugins.barchartPlugin.getPluginModule(),
        importPlugin: () => Promise.resolve(plugins.barchartPlugin),
      },
    ]);
  }, [plugins]);

  // Show loading states
  if (isLoading) return <LoadingIndicator message="Loading dashboard..." />;
  if (!isClient) return <LoadingIndicator message="Initializing..." />;
  if (!plugins) return <LoadingIndicator message="Loading plugins..." />;
  if (!decodedDashboard) return <div>Dashboard not found</div>;
  if (!pluginLoader)
    return <LoadingIndicator message="Setting up plugins..." />;

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
              Datasource: "HumanlogDatasource",
              TimeSeriesQuery: "HumanlogTimeSeriesQuery",
              Panel: "TimeSeriesChart",
            }}
          >
            <DatasourceStoreProvider
              dashboardResource={decodedDashboard}
              datasourceApi={mockDatasourceApi}
            >
              <TimeRangeProvider
                refreshInterval="30s"
                timeRange={{ pastDuration: "1h" }}
              >
                <VariableProvider>
                  <ValidationProvider>
                    <DashboardProvider
                      initialState={{
                        dashboardResource: decodedDashboard,
                        isEditMode: true,
                      }}
                    >
                      <div className="min-h-screen bg-white p-6 text-black dark:bg-gray-900 dark:text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h1 className="mb-1 text-2xl font-bold">
                              {data?.dashboard?.name}
                            </h1>
                            <p className="text-muted-foreground mb-6">
                              {data?.dashboard?.description}
                            </p>
                          </div>
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
                </VariableProvider>
              </TimeRangeProvider>
            </DatasourceStoreProvider>
          </PluginRegistry>
        </SnackbarProvider>
      </ChartsProvider>
    </ThemeProvider>
  );
}

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
import * as traceTablePlugin from "@perses-dev/trace-table-plugin";
import * as tracingGanttChartPlugin from "@perses-dev/tracing-gantt-chart-plugin";
import * as tablePlugin from "@perses-dev/table-plugin";
import * as barchartPlugin from "@perses-dev/bar-chart-plugin";
import * as humanlogPlugin from "@humanlogio/perses-plugin";
import { useTheme } from "next-themes";
import { DashboardControls } from "@/app/[org]/[env]/project/dashboard/[id]/components/DashboardControls";
import { Suspense, useMemo } from "react";
import { getDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { useQuery } from "@connectrpc/connect-query";
import { DashboardResource } from "@perses-dev/core";
import { mockDatasourceApi } from "@/lib/mocks/sampleDashboards";
import { useSearchParams } from "next/navigation";
import { BrowserRouter } from "react-router-dom";

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

function DashboardClientContent({ dashboardId }: DashboardClientProps) {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const projectName = searchParams.get("projectName") || undefined;
  const { isLoading, data } = useQuery(getDashboard, {
    id: dashboardId,
    projectName,
  });

  // Decode the persesJson bytes back to DashboardResource
  const decodedDashboard = useMemo(() => {
    const dashboard = decodePersesJson(data?.dashboard?.spec?.persesJson);

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

      if (!dashboard.spec.datasources["humanlog-hosted"]) {
        dashboard.spec.datasources["humanlog-hosted"] = {
          default: false,
          plugin: {
            kind: "HumanlogDatasource",
            spec: {
              directUrl:
                process.env.NEXT_PUBLIC_HUMANLOG_API_URL ||
                "https://api.humanlog.io",
            },
          },
        };
      }

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
  }, [data?.dashboard?.spec?.persesJson]);

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
      resource: humanlogPlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(humanlogPlugin),
    },
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
    {
      resource: traceTablePlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(traceTablePlugin),
    },
    {
      resource: tracingGanttChartPlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(tracingGanttChartPlugin),
    },
    {
      resource: tablePlugin.getPluginModule(),
      importPlugin: () => Promise.resolve(tablePlugin),
    },
  ]);

  if (isLoading) return <div>Loading...</div>;

  if (!decodedDashboard) return <div>Dashboard not found</div>;

  return (
    <BrowserRouter>
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
                TraceQuery: "HumanlogTraceQuery",
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
                                {data?.dashboard?.spec?.name}
                              </h1>
                              <p className="text-muted-foreground mb-6">
                                {data?.dashboard?.spec?.description}
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
    </BrowserRouter>
  );
}

export function DashboardClient({ dashboardId }: DashboardClientProps) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardClientContent dashboardId={dashboardId} />
    </Suspense>
  );
}

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
import { useTheme } from "next-themes";

import { mockDatasourceApi, mockDashboard } from "@/lib/mocks/sampleDashboards";
import { DashboardControls } from "@/app/localhost/dashboard/components/DashboardControls";

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
                  dashboardResource={mockDashboard}
                  datasourceApi={mockDatasourceApi}
                >
                  <ValidationProvider>
                    <DashboardProvider
                      initialState={{
                        dashboardResource: mockDashboard,
                        isEditMode: true,
                      }}
                    >
                      <div className="min-h-screen bg-white p-6 text-black dark:bg-gray-900 dark:text-white">
                        <div className="flex items-center justify-between">
                          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
                          <DashboardControls
                            dashboardResource={mockDashboard}
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

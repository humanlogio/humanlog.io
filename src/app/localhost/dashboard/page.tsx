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
} from "@perses-dev/core";
import { useTheme } from "next-themes";

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

// Complete dashboard resource with panels, layouts, and datasources
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

export default function DashboardPage() {
  const { theme } = useTheme();

  // Use next-themes theme state with Perses theme
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

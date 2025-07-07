import {
  DashboardResource,
  GlobalDatasourceResource,
  DatasourceResource,
} from "@perses-dev/core";
import { DatasourceApi } from "@perses-dev/dashboards";

// Mock Prometheus datasource
// TODO: Replace directUrl with backend API endpoint when backend infrastructure is ready
// Currently pointing to Docker Prometheus instance at localhost:9090

const PROMETHEUS_URL = "http://localhost:9090";

export const mockPrometheusDatasource: GlobalDatasourceResource = {
  kind: "GlobalDatasource",
  metadata: { name: "prometheus" },
  spec: {
    default: true,
    plugin: {
      kind: "PrometheusDatasource",
      spec: {
        directUrl: PROMETHEUS_URL,
      },
    },
  },
};

// Mock dashboard configuration
export const mockDashboard: DashboardResource = {
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
            directUrl: PROMETHEUS_URL,
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

// Mock Datasource API implementation
class MockDatasourceApi implements DatasourceApi {
  getDatasource(): Promise<DatasourceResource | undefined> {
    return Promise.resolve(undefined);
  }

  getGlobalDatasource(): Promise<GlobalDatasourceResource | undefined> {
    return Promise.resolve(mockPrometheusDatasource);
  }

  listDatasources(): Promise<DatasourceResource[]> {
    return Promise.resolve([]);
  }

  listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return Promise.resolve([mockPrometheusDatasource]);
  }

  buildProxyUrl(): string {
    // TODO: Update this to return the actual backend API proxy URL
    // when backend infrastructure is implemented
    return "/prometheus";
  }
}

export const mockDatasourceApi = new MockDatasourceApi();

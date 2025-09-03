import {
  DashboardResource,
  GlobalDatasourceResource,
  DatasourceResource,
} from "@perses-dev/core";
import { DatasourceApi } from "@perses-dev/dashboards";
import {
  ListDashboardResponse_ListItem,
  ListDashboardResponse_ListItemSchema,
} from "api/js/svc/dashboard/v1/service_pb";
import { DashboardSchema } from "api/js/types/v1/dashboard_pb";
import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";

const directUrl = "http://localhost:32764";

export const localhostHumanlogDatasource: GlobalDatasourceResource = {
  kind: "GlobalDatasource",
  metadata: { name: "localhost" },
  spec: {
    default: true,
    plugin: {
      kind: "HumanlogDatasource",
      spec: {
        directUrl: directUrl,
      },
    },
  },
};

export const mockPrometheusDatasource: GlobalDatasourceResource = {
  kind: "GlobalDatasource",
  metadata: { name: "prometheus" },
  spec: {
    default: true,
    plugin: {
      kind: "PrometheusDatasource",
      spec: {
        directUrl,
      },
    },
  },
};

// Create a default dashboard template for new dashboards
export function createDefaultDashboardTemplate(
  name: string,
  description: string = "",
): DashboardResource {
  return {
    kind: "Dashboard",
    metadata: {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      project: "default",
    },
    spec: {
      display: {
        name: name,
        description: description || "Getting started with your new dashboard",
      },
      datasources: {
        prometheus: {
          default: true,
          plugin: {
            kind: "PrometheusDatasource",
            spec: {
              directUrl,
            },
          },
        },
      },
      duration: "1h",
      refreshInterval: "30s",
      variables: [],
      panels: {},
      layouts: [
        {
          kind: "Grid" as const,
          spec: {
            display: {
              title: "Getting Started",
              collapse: { open: true },
            },
            items: [],
          },
        },
      ],
    },
  };
}

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
            directUrl,
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

// Mock dashboard list
export const createMockDashboards = (): ListDashboardResponse_ListItem[] => {
  const now = new Date();
  const mockDashboards = [
    {
      id: "1",
      name: "System Monitoring",
      description:
        "Real-time system metrics and performance monitoring dashboard",
      isReadonly: false,
      createdAt: timestampFromDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
      updatedAt: timestampFromDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      id: "2",
      name: "Application Metrics",
      description: "Application performance, error rates, and user analytics",
      isReadonly: false,
      createdAt: timestampFromDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
      updatedAt: timestampFromDate(new Date(now.getTime() - 30 * 60 * 1000)),
    },
    {
      id: "3",
      name: "Infrastructure Overview",
      description:
        "Server health, database performance, and network statistics",
      isReadonly: true,
      createdAt: timestampFromDate(
        new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      ),
      updatedAt: timestampFromDate(
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      id: "4",
      name: "User Analytics",
      description:
        "User behavior analysis, conversion rates, and engagement metrics",
      isReadonly: false,
      createdAt: timestampFromDate(
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      ),
      updatedAt: timestampFromDate(
        new Date(now.getTime() - 1 * 60 * 60 * 1000),
      ),
    },
    {
      id: "5",
      name: "Security Dashboard",
      description:
        "Security events, threat detection, and compliance monitoring",
      isReadonly: true,
      createdAt: timestampFromDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
      updatedAt: timestampFromDate(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
    },
  ];

  return mockDashboards.map((mock) =>
    create(ListDashboardResponse_ListItemSchema, {
      dashboard: create(DashboardSchema, {
        id: mock.id,
        name: mock.name,
        description: mock.description,
        isReadonly: mock.isReadonly,
        createdAt: mock.createdAt,
        updatedAt: mock.updatedAt,
      }),
    }),
  );
};

// Mock Datasource API implementation
class MockDatasourceApi implements DatasourceApi {
  getDatasource(): Promise<DatasourceResource | undefined> {
    return Promise.resolve(undefined);
  }

  getGlobalDatasource(): Promise<GlobalDatasourceResource | undefined> {
    return Promise.resolve(localhostHumanlogDatasource);
  }

  listDatasources(): Promise<DatasourceResource[]> {
    return Promise.resolve([]);
  }

  listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return Promise.resolve([localhostHumanlogDatasource]);
  }

  buildProxyUrl(): string {
    // TODO: Update this to return the actual backend API proxy URL
    // when backend infrastructure is implemented
    return "/prometheus";
  }
}

export const mockDatasourceApi = new MockDatasourceApi();

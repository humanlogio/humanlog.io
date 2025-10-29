import {
  GlobalDatasourceResource,
  DatasourceResource,
  DatasourceSelector,
} from "@perses-dev/core";
import { DatasourceApi } from "@perses-dev/dashboards";

import { getAPIURL } from "@/lib/config/envs";
import {
  HUMANLOG_DATASOURCE_KIND,
  LOCALHOST_URL,
  HUMANLOG_LOCALHOST_NAME,
} from "@/lib/datasources/constants";

export interface LocalhostConfig {
  // URL for the localhost API (defaults to http://localhost:32764)
  url?: string;
}
export interface HostedConfig {
  // Name of the datasource.
  name: string;
  // URL for the hosted API (defaults to getAPIURL())
  url?: string;
  // Additional options for the hosted datasource
  options?: Record<string, any>;
}

// Configuration interface for datasource API
export interface DatasourceApiConfig {
  // Configuration for the localhost environment
  localhost: LocalhostConfig;
  // Configuration for the hosted environment
  hosted?: HostedConfig;
  wrapped?: DatasourceApi;
}

// Create Humanlog datasource for localhost
const createLocalhostDatasource = (
  config: {
    url?: string;
    options?: Record<string, any>;
  } = {},
): GlobalDatasourceResource => ({
  kind: "GlobalDatasource",
  metadata: { name: HUMANLOG_LOCALHOST_NAME },
  spec: {
    default: true,
    plugin: {
      kind: HUMANLOG_DATASOURCE_KIND,
      spec: {
        directUrl: config.url || LOCALHOST_URL,
      },
    },
  },
});

// Create Humanlog datasource for hosted environment
const createHostedDatasource = (
  config: HostedConfig,
): GlobalDatasourceResource => ({
  kind: "GlobalDatasource",
  metadata: { name: config.name },
  spec: {
    default: false,
    plugin: {
      kind: HUMANLOG_DATASOURCE_KIND,
      spec: {
        directUrl: config.url || getAPIURL(),
      },
    },
  },
});

export class CustomDatasourceApi implements DatasourceApi {
  private baseDatasources: GlobalDatasourceResource[];
  private wrapped?: DatasourceApi;

  constructor(config: DatasourceApiConfig) {
    const localhostDatasource = createLocalhostDatasource(config.localhost);
    this.baseDatasources = [localhostDatasource];
    if (config.hosted) {
      const hostedDatasource = createHostedDatasource(config.hosted);
      this.baseDatasources.push(hostedDatasource);
    }
    this.wrapped = config.wrapped;
  }

  getDatasource(
    project: string,
    selector: DatasourceSelector,
  ): Promise<DatasourceResource | undefined> {
    if (this.wrapped) {
      return this.wrapped.getDatasource(project, selector as any);
    }
    return Promise.resolve(undefined);
  }

  getGlobalDatasource(
    selector: DatasourceSelector,
  ): Promise<GlobalDatasourceResource | undefined> {
    const hlds = this.baseDatasources.find((ds) => {
      if (!selector.name) {
        return ds.kind === selector.kind;
      }
      return ds.kind === selector.kind && ds.metadata.name === selector.name;
    });
    if (hlds) {
      return Promise.resolve(hlds);
    }
    return this.wrapped!.getGlobalDatasource(selector);
  }

  listDatasources(
    project: string,
    pluginKind?: string,
  ): Promise<DatasourceResource[]> {
    return this.wrapped!.listDatasources(project, pluginKind);
  }

  async listGlobalDatasources(
    pluginKind?: string,
  ): Promise<GlobalDatasourceResource[]> {
    const all = this.baseDatasources.filter((src) => {
      if (pluginKind) {
        return src.kind === pluginKind;
      }
      return true;
    });
    if (!this.wrapped) {
      return Promise.resolve(all);
    }
    const others = await this.wrapped?.listGlobalDatasources(pluginKind);
    if (!others) {
      return Promise.resolve(all);
    }
    return Promise.resolve(all.concat(others));
  }
}

/**
 * Create a configured datasource API instance
 * @param config Configuration for the datasource API
 * @returns CustomDatasourceApi instance
 */
export function createDatasourceApi(
  config: DatasourceApiConfig,
): CustomDatasourceApi {
  return new CustomDatasourceApi(config);
}

export const DATASOURCE_KINDS = {
  HUMANLOG: "HumanlogDatasource",
  PROMETHEUS: "PrometheusDatasource",
  GLOBAL: "GlobalDatasource",
} as const;

// Datasource names
export const DATASOURCE_NAMES = {
  HUMANLOG_LOCALHOST: "humanlog-localhost",
  HUMANLOG_HOSTED: "humanlog-hosted",
  HUMANLOG_LEGACY: "humanlog",
  PROMETHEUS: "prometheus",
  LOCALHOST: "localhost",
} as const;

// URLs
export const DATASOURCE_URLS = {
  LOCALHOST: "http://localhost:32764",
} as const;

// Export individual constants for convenience
export const {
  HUMANLOG: HUMANLOG_DATASOURCE_KIND,
  PROMETHEUS: PROMETHEUS_DATASOURCE_KIND,
  GLOBAL: GLOBAL_DATASOURCE_KIND,
} = DATASOURCE_KINDS;

export const {
  HUMANLOG_LOCALHOST: HUMANLOG_LOCALHOST_NAME,
  HUMANLOG_HOSTED: HUMANLOG_HOSTED_NAME,
  HUMANLOG_LEGACY: HUMANLOG_LEGACY_NAME,
  PROMETHEUS: PROMETHEUS_NAME,
  LOCALHOST: LOCALHOST_NAME,
} = DATASOURCE_NAMES;

export const { LOCALHOST: LOCALHOST_URL } = DATASOURCE_URLS;

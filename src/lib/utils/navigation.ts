// User
export function getUserSettingsUrl() {
  return `/user/edit`;
}

// Org
export function getOrgUrl(orgName: string) {
  return `/org/${orgName}`;
}

export function getOrgSettingsUrl(orgName: string) {
  return `/org/${orgName}/edit`;
}

// Env
export function getEnvUrl(envName: string, orgName?: string) {
  if (orgName) {
    return `/org/${orgName}/env/${envName}`;
  }
  return `/env/${envName}`;
}

export function getEnvSettingsUrl(envName: string, orgName: string) {
  return `/org/${orgName}/env/${envName}/edit`;
}

export function getNewEnvUrl(orgName?: string) {
  return orgName ? `/org/${orgName}/env/new` : "/env/new";
}

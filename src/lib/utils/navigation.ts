export function getEnvironmentUrl(envName: string, orgName?: string) {
  if (orgName) {
    return `/org/${orgName}/env/${envName}`;
  }
  return `/env/${envName}`;
}

export function getNewEnvironmentUrl(orgName?: string) {
  if (orgName) {
    return `/org/${orgName}/env/new`;
  }
  return "/env/new";
}

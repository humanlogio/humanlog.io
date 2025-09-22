import { UserInfo } from "@/context/list-environments";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  userInfo: UserInfo,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
  activePage?: string,
) {
  if (!userInfo || userInfo === "isLoading") return "/";

  const page = activePage || "query";

  return `/${userInfo.currentOrganization?.name}/${activeEnvironment?.environment?.name ?? "localhost"}/${page}`;
}

export function buildOrgEnvUrl(
  orgName: string,
  envName: string,
  activePage?: string,
): string {
  const page = activePage || "query";
  return `/${orgName}/${envName}/${page}`;
}

export function getOrgSettingsUrl(orgName: string) {
  return `/org/${orgName}/edit`;
}

export function getNewEnvUrl(orgName?: string) {
  return orgName ? `/org/${orgName}/env/new` : "/env/new";
}

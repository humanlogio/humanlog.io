import { UserInfo } from "@/context/list-environments";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  userInfo: UserInfo,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
) {
  if (!userInfo || userInfo === "isLoading") return "/";

  return `/${userInfo.currentOrganization?.name}/${activeEnvironment?.environment?.name ?? "localhost"}/query`;
}

export function getOrgSettingsUrl(orgName: string) {
  return `/org/${orgName}/edit`;
}

export function getEnvSettingsUrl(envName: string, orgName: string) {
  return `/org/${orgName}/env/${envName}/edit`;
}

export function getNewEnvUrl(orgName?: string) {
  return orgName ? `/org/${orgName}/env/new` : "/env/new";
}

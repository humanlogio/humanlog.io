import { UserInfo } from "@/context/list-environments";
import { Environment } from "api/js/types/v1/environment_pb";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  userInfo: UserInfo,
  activeEnvironment?: Environment,
) {
  if (!userInfo || userInfo === "isLoading") return "/";

  return `/${userInfo.currentOrganization?.name}/${activeEnvironment?.name ?? "localhost"}/query`;
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

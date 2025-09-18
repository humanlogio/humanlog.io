import { UserInfo } from "@/context/list-environments";
import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  userInfo: UserInfo,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
  currentPath?: string,
) {
  if (!userInfo || userInfo === "isLoading") return "/";

  const page = extractPageFromPath(currentPath) || "query";

  return `/${userInfo.currentOrganization?.name}/${activeEnvironment?.environment?.name ?? "localhost"}/${page}`;
}

export function extractPageFromPath(path?: string): string | null {
  if (!path) return null;

  const segments = path.replace(/^\//, "").split("/");

  if (segments.length >= 3) {
    return segments.slice(2).join("/");
  }

  return null;
}

export function buildOrgEnvUrl(
  orgName: string,
  envName: string,
  currentPath?: string,
): string {
  const page = extractPageFromPath(currentPath) || "query";
  return `/${orgName}/${envName}/${page}`;
}

export function getOrgSettingsUrl(orgName: string) {
  return `/org/${orgName}/edit`;
}

export function getNewEnvUrl(orgName?: string) {
  return orgName ? `/org/${orgName}/env/new` : "/env/new";
}

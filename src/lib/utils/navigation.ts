import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { toast } from "sonner";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  userData: WhoamiResponse | undefined,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
  activePage?: string,
) {
  if (!userData) {
    // toast.error("You need to login to access this page");
    return "/";
  }

  const page = activePage || "query";
  return `/${userData.currentOrganization?.name}/${activeEnvironment?.environment?.name ?? "localhost"}/${page}`;
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

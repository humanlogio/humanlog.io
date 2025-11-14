import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { toast } from "sonner";
import { MockOrganization } from "@/lib/utils/mock-user-data";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  currentOrganization: MockOrganization | undefined,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
  activePage?: string,
) {
  if (!currentOrganization) {
    toast.error("You need to login to access this page");
    return "/";
  }

  const page = activePage || "query";
  // TODO: get org name from separate API or something...
  return `/${currentOrganization.name}/${activeEnvironment?.environment?.name ?? "localhost"}/${page}`;
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

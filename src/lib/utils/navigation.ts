import { ListEnvironmentResponse_ListItem } from "api/js/svc/organization/v1/service_pb";
import { toast } from "sonner";
import { Organization } from "better-auth/plugins";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  activeOrganization: Organization | null,
  activeEnvironment?: ListEnvironmentResponse_ListItem,
  activePage?: string,
) {
  if (!activeOrganization) {
    toast.error("No active organization found");
    return "/create-org";
  }

  const page = activePage || "query";
  return `/${activeOrganization.slug}/${activeEnvironment?.environment?.name ?? "localhost"}/${page}`;
}

export function buildOrgEnvUrl(
  orgSlug: string,
  envName: string,
  activePage?: string,
): string {
  const page = activePage || "query";
  return `/${orgSlug}/${envName}/${page}`;
}

export function getOrgSettingsUrl(orgName: string) {
  return `/org/${orgName}/edit`;
}

export function getNewEnvUrl(orgName?: string) {
  return orgName ? `/org/${orgName}/env/new` : "/env/new";
}

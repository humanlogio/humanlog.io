import { Organization } from "better-auth/plugins";
import { ActiveEnvironment } from "@/stores/environment-store";

// User
export function getUserSettingsUrl() {
  return `/settings/users`;
}

export function getOrgEnvUrl(
  activeOrganization: Organization | null,
  activeEnvironment: Exclude<ActiveEnvironment, undefined>,
  activePage?: string,
) {
  const page = activePage || "query";

  if (!activeOrganization) {
    return "/set-org";
  }

  if (activeEnvironment?.type === "localhost") {
    return `/${activeOrganization.slug}/localhost/${page}`;
  }

  return `/${activeOrganization.slug}/${activeEnvironment.data.environment?.name ?? "localhost"}/${page}`;
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

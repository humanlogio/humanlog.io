"use client";

import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import LoadingIndicator from "@/components/loading-indicator";
import { CreateOrg } from "@/app/settings/org/create-org";
import { OrgSettingForm } from "@/app/settings/org/org-setting-form";
import { OrgSwitcher } from "@/components/header/org-switcher";

export default function OrgSettingsPage() {
  const { useSession, useActiveOrganization, useListOrganizations } =
    authClient;
  const { data: session } = useSession();
  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    useActiveOrganization();
  const { data: listOrganizations, isPending: isListOrganizationsPending } =
    useListOrganizations();

  const render = useMemo(() => {
    if (!session) return;

    if (isActiveOrganizationPending || isListOrganizationsPending)
      return <LoadingIndicator />;
    if (!activeOrganization) {
      if (listOrganizations && listOrganizations.length > 0) {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <div className="w-full">
              <p className="font-semibold">Select an organization first</p>
              <OrgSwitcher user={session?.user} />
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <CreateOrg />
          </div>
        );
      }
    }
    return (
      <OrgSettingForm
        activeOrganization={activeOrganization}
        user={session.user}
      />
    );
  }, [
    isActiveOrganizationPending,
    activeOrganization,
    listOrganizations,
    session,
  ]);

  return render;
}

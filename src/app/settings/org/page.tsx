"use client";

import { authClient } from "@/lib/auth-client";
import LoadingIndicator from "@/components/loading-indicator";
import { OrgSettingForm } from "@/app/settings/org/org-setting-form";

export default function OrgSettingsPage() {
  const { useSession, useActiveOrganization } = authClient;
  const { data: session } = useSession();
  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    useActiveOrganization();

  if (isActiveOrganizationPending) {
    return <LoadingIndicator />;
  }

  if (!activeOrganization || !session?.user) return;

  return (
    <OrgSettingForm
      activeOrganization={activeOrganization}
      user={session?.user}
    />
  );
}

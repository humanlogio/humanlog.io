"use client";

import { EnvironmentCreationForm } from "@/components/env/env-creation-form";
import { authClient } from "@/lib/auth-client";

export default function NewEnvironmentPage() {
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={activeOrganization?.id} />
    </div>
  );
}

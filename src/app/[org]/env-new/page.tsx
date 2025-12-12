"use client";

import { EnvironmentCreationForm } from "@/components/env/env-creation-form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewEnvironmentPage() {
  const router = useRouter();
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();

  useEffect(() => {
    if (!activeOrganization) return;
    const url = `/${activeOrganization.slug}/env-new`;
    router.replace(url);
  }, [activeOrganization]);

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Create a new environment</h1>
      <EnvironmentCreationForm orgId={activeOrganization?.id} />
    </div>
  );
}

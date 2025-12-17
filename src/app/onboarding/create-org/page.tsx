"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateOrg } from "@/components/organization/create-org";
import { authClient } from "@/lib/auth-client";

export default function OnboardingCreateOrgPage() {
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();
  const router = useRouter();

  const onSuccess = () => {
    toast.success("Organization created successfully");
    router.push(`/${activeOrganization?.slug}/localhost/query`);

    // TODO
    // router.push("/onboarding/pricing");
  };
  return (
    <div className="flex h-full w-full items-center justify-center">
      <CreateOrg title="Create your first organization" onSuccess={onSuccess} />
    </div>
  );
}

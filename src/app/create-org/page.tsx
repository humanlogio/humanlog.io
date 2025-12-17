"use client";

import { CreateOrg } from "@/components/organization/create-org";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function CreateOrgPage() {
  const router = useRouter();
  const { useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();

  const onSuccess = () => {
    toast.success("Organization created successfully");
    router.push(`/${activeOrganization?.slug}/localhost/query`);
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <CreateOrg title="Create your organization" onSuccess={onSuccess} />
    </div>
  );
}

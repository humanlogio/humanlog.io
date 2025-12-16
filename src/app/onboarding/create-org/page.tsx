"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateOrg } from "@/components/organization/create-org";

export default function OnboardingCreateOrgPage() {
  const router = useRouter();

  const onSuccess = () => {
    toast.success("Organization created successfully");
    router.push("/onboarding/pricing");
  };
  return (
    <div className="flex h-full w-full items-center justify-center">
      <CreateOrg title="Create your first organization" onSuccess={onSuccess} />
    </div>
  );
}

"use client";

import { OrgSwitcher } from "@/components/header/org-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateOrgPage() {
  const router = useRouter();
  const { useSession, useListOrganizations, useActiveOrganization } =
    authClient;
  const { activeEnvironment } = useEnvironmentStore();
  const { data: session } = useSession();
  const { data: activeOrganization } = useActiveOrganization();
  const { data: listOrganizations, isPending } = useListOrganizations();

  useEffect(() => {
    if (!activeOrganization) return;
    if (!activeEnvironment) {
      router.push("/");
      return;
    }
    router.push(getOrgEnvUrl(activeOrganization, activeEnvironment, "query"));
  }, [activeOrganization]);

  if (!session || isPending) return;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {!listOrganizations?.length ? (
        <CreateOrg />
      ) : (
        <div className="max-w-xl">
          <OrgSwitcher user={session?.user} />
        </div>
      )}
    </div>
  );
}

const CreateOrg = () => {
  const router = useRouter();
  const { organization, useSession } = authClient;
  const { data: session } = useSession();
  const [orgName, setOrgName] = useState("");

  const handleCreateOrg = async () => {
    await organization.create(
      {
        name: orgName,
        slug: orgName,
        userId: session?.user.id,
        keepCurrentActiveOrganization: true,
        metadata: {
          createdBy: session?.user.id,
        },
      },
      {
        onSuccess: () => {
          toast.success("Organization created successfully");
          router.push("/");
        },
        onError: (error) => {
          toast.error("Failed to create organization");
          console.error(error);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Create a new organization and become its owner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCreateOrg}
          disabled={!orgName.trim()}
        >
          Create Organization
        </Button>
      </CardFooter>
    </Card>
  );
};

"use client";

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
import { useState } from "react";

export default function CreateOrgPage() {
  const { organization, useSession } = authClient;
  const { data: session } = useSession();
  const [orgName, setOrgName] = useState("");

  const handleCreateOrg = async () => {
    await organization.create({
      name: orgName,
      slug: orgName,
      userId: session?.user.id,
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
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
    </div>
  );
}

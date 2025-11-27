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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const CreateOrg = () => {
  const { organization, useSession } = authClient;
  const { data: session } = useSession();
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrg = async () => {
    setIsLoading(true);
    await organization.create(
      {
        name: orgName,
        slug: orgName,
        userId: session?.user.id,
        metadata: {
          createdBy: session?.user.id,
        },
      },
      {
        onSuccess: () => {
          toast.success("Organization created successfully");
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(`Failed to create organization: ${error.error.message}`);
          console.error(error);
          setIsLoading(false);
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
          disabled={!orgName.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Create Organization"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

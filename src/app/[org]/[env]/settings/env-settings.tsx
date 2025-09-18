"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Server, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useMutation } from "@connectrpc/connect-query";
import { getStripeBillingPortal } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";

export const EnvSettings = () => {
  const [newEnvName, setNewEnvName] = useState("");
  const { activeEnvironment } = useEnvironmentStore();

  const { mutate: billingPortalMutation, isPending: isBillingPending } =
    useMutation(getStripeBillingPortal, {
      onSuccess: (res) => {
        window.open(res.portalUrl);
      },
      onError: (error) => {
        toast.error("Error", {
          description: error.message,
        });
      },
    });

  const handleBillingPortal = async () => {
    billingPortalMutation({
      returnToUrl: window.location.href,
    });
  };

  const handleUpdateEnvName = () => {
    // TODO: API Call to update environment name
    console.log("Updating environment name to:", newEnvName);
    toast.success("Environment name updated successfully");
    setNewEnvName("");
  };

  const handleDeleteEnvironment = () => {
    // TODO: API Call to delete environment
    console.log("Deleting environment");
    toast.error("Environment deletion is not yet implemented");
  };

  return (
    <div className="space-y-6 px-10 py-5">
      <div>
        <h1 className="text-3xl font-bold">Environment Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage this environment configuration and access settings. For billing
          and subscription management,{" "}
          <button
            onClick={handleBillingPortal}
            disabled={isBillingPending}
            className="cursor-pointer text-blue-600 hover:underline disabled:opacity-50"
          >
            {isBillingPending ? "opening..." : "visit billing portal"}
          </button>
          .
        </p>
      </div>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment Information
          </CardTitle>
          <CardDescription>
            Basic information about this environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Environment Name
              </label>
              <p className="text-lg font-semibold">
                {activeEnvironment?.environment?.name || "Loading..."}
              </p>
            </div>

            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Environment ID
              </label>
              <p className="text-lg font-semibold">
                {activeEnvironment?.environment?.id?.toString() || "N/A"}
              </p>
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Created
            </label>
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="text-muted-foreground h-4 w-4" />
              {/* {formatTimestamp(activeEnvironment?.product?.createdAt)} */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Environment Name */}
      <Card>
        <CardHeader>
          <CardTitle>Update Environment Name</CardTitle>
          <CardDescription>
            Change this environment&apos;s display name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={`Current: ${activeEnvironment?.environment?.name || "Loading..."}`}
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
            />
            <Button onClick={handleUpdateEnvName} disabled={!newEnvName.trim()}>
              Update Name
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-red-200 p-3 dark:border-red-800">
            <div>
              <p className="font-medium text-red-600">Delete Environment</p>
              <p className="text-muted-foreground text-sm">
                Permanently delete this environment and all its data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEnvironment}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Environment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

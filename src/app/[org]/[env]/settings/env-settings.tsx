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
import { Badge } from "@/components/ui/badge";

import {
  Server,
  Calendar,
  CreditCard,
  Trash2,
  AlertTriangle,
  Database,
} from "lucide-react";
import { useQuery } from "@connectrpc/connect-query";
import { listPaymentMethod } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { toast } from "sonner";
import { useEnvironmentStore } from "@/stores/environment-store";

export const EnvSettings = () => {
  const [newEnvName, setNewEnvName] = useState("");
  const { activeEnvironment } = useEnvironmentStore();

  // TODO: use useInfiniteQuery
  const { data: listPaymentMethodData } = useQuery(listPaymentMethod);

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
          Manage your environment configuration, members, and access settings
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
            Change your environment&apos;s display name
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

      {/* Usage & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Usage & Billing
          </CardTitle>
          <CardDescription>
            Current usage statistics and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t pt-4">
            <label className="text-muted-foreground text-sm font-medium">
              Payment Method
            </label>
            {listPaymentMethodData?.items &&
            listPaymentMethodData?.items.length > 0 ? (
              <div className="mt-2 flex items-center gap-3">
                <CreditCard className="h-4 w-4" />
                <span>
                  •••• •••• ••••
                  {listPaymentMethodData?.items[0].paymentMethod?.type?.case ===
                  "card"
                    ? listPaymentMethodData?.items[0].paymentMethod?.type.value
                        .last4
                    : ""}
                </span>
                <Badge variant="secondary">
                  {listPaymentMethodData?.items[0].paymentMethod?.type?.case}
                </Badge>
                {/* {listPaymentMethodData?.items[0].paymentMethod && (
                <Badge className="bg-blue-100 text-blue-800">Default</Badge>
              )} */}
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                No payment methods found
              </p>
            )}
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

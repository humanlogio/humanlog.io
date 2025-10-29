"use client";

import LoadingIndicator from "@/components/loading-indicator";
import { UserSettingsForm } from "@/components/user/user-settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Building,
  CreditCard,
  Loader,
  UserIcon,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils/format-timestamp";
import { toast } from "sonner";
import { useMutation } from "@connectrpc/connect-query";
import { getStripeBillingPortal } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { gravatarURL } from "@/lib/utils/avatar";
import { useUser } from "@/hooks/useUser";

export default function UserSettingsPage() {
  const { userData, isLoadingUser, refetchUser } = useUser();

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

  if (isLoadingUser) return <LoadingIndicator />;

  if (!userData) {
    return (
      <div className="container flex flex-grow flex-col items-center justify-center gap-8">
        You need to login to access this page.
      </div>
    );
  }

  const isDefaultOrg =
    userData?.currentOrganization?.id === userData?.defaultOrganization?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal account settings and preferences
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your personal account details and current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={gravatarURL(userData.user?.email)} />
              <AvatarFallback className="text-lg">
                {userData.user?.firstName?.slice(0, 2) || (
                  <UserIcon size={14} />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {userData?.user?.firstName && userData?.user?.lastName
                    ? `${userData.user.firstName} ${userData.user.lastName}`
                    : userData?.user?.firstName || "No name set"}
                </h3>
                {userData?.user?.username && (
                  <Badge variant="secondary">@{userData.user.username}</Badge>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{userData?.user?.email}</span>
              </div>
              {userData?.user?.createdAt && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatTimestamp(userData.user.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Current Organization
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Building className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">
                {userData?.currentOrganization?.name}
              </span>
              {isDefaultOrg && (
                <Badge className="bg-orange-100 text-orange-800">Default</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Subscriptions
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="items-center justify-between md:flex">
            <div className="mb-2 md:mb-0">
              <p className="font-medium">Subscription Management</p>
              <p className="text-muted-foreground text-sm">
                View and manage your billing details, payment methods, and
                subscription plans
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleBillingPortal} disabled={isBillingPending}>
                {isBillingPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Manage Billing"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSettingsForm userData={userData} refetchUserData={refetchUser} />
        </CardContent>
      </Card>
    </div>
  );
}

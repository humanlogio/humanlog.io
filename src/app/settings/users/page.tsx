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
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils/format-timestamp";
import { toast } from "sonner";
import { useMutation } from "@connectrpc/connect-query";
import { getStripeBillingPortal } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { gravatarURL } from "@/lib/utils/avatar";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserSettingsPage() {
  const router = useRouter();

  const { useSession, deleteUser } = authClient;
  const {
    data: session,
    refetch: refetchSession,
    isPending: isPendingSession,
  } = useSession();
  const user = session?.user;

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
  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    await deleteUser({
      fetchOptions: {
        onSuccess: () => {
          toast.success("User deleted successfully");
          router.push("/sign-in");
        },
        onError: (ctx) => {
          console.error(ctx.error);
          toast.error(ctx.error.message);
        },
      },
    });
  };

  if (isPendingSession) return <LoadingIndicator />;

  if (!user) {
    return (
      <div className="container flex grow flex-col items-center justify-center gap-8">
        You need to login to access this page.
      </div>
    );
  }

  // TODO: add default organization
  // const isDefaultOrg =
  //   userData?.currentOrganization?.id === userData?.defaultOrganization?.id;

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
              <AvatarImage src={gravatarURL(user?.email)} />
              <AvatarFallback className="text-lg">
                {user.name || <UserIcon size={14} />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {user?.name && <Badge variant="secondary">@{user.name}</Badge>}
              </div>
              <div className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              {user?.createdAt && (
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.createdAt.toDateString()}</span>
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
                {/* {userData?.currentOrganization?.name} */}
              </span>
              {/* {isDefaultOrg && (
                <Badge className="bg-orange-100 text-orange-800">Default</Badge>
              )} */}
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
          <UserSettingsForm user={user} refetchSession={refetchSession} />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-4">
            <div className="items-center justify-between md:flex">
              <div className="mb-4 md:mb-0">
                <h4 className="text-destructive font-semibold">
                  Delete Account
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

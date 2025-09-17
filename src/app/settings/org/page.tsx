"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAllEnvironments } from "@/context/list-environments";
import { createOrganization } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { useState } from "react";
import {
  Trash2,
  Crown,
  Settings,
  Mail,
  Calendar,
  Users,
  Building,
  UserIcon,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils/formatTimeStamp";
import {
  inviteUser,
  listUser,
  listUserInvitation,
  revokeUserInvitation,
} from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { toast } from "sonner";
import { gravatarURL } from "@/lib/utils/avatar";

export default function OrgSettingsPage() {
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const { userInfo } = useAllEnvironments();

  const { data: listUserData } = useQuery(listUser);

  // TODO: use useInfiniteQuery
  const { data: listUserInvitationData } = useQuery(listUserInvitation);

  const { mutate: inviteUserMutation } = useMutation(inviteUser, {
    onSuccess: () => {
      toast.success("User invitation sent successfully");
      setEmail("");
    },
    onError: (error) => {
      toast.error("Failed to send invitation");
      console.error(error);
    },
  });

  const { mutate: createOrgMutation } = useMutation(createOrganization, {
    onSuccess: () => {
      toast.success("Organization created successfully");
      setEmail("");
    },
    onError: (error) => {
      toast.error("Failed to create organization");
      console.error(error);
    },
  });

  const { mutate: revokeInviteMutation } = useMutation(revokeUserInvitation, {
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
    },
    onError: (error) => {
      toast.error("Failed to cancel invitation");
      console.error(error);
    },
  });

  if (userInfo === "isLoading") return;

  const isDefaultOrg =
    userInfo?.currentOrganization?.id === userInfo?.defaultOrganization?.id;

  const handleInviteUser = () => {
    inviteUserMutation({
      userEmail: email,
    });
    setEmail("");
  };

  const handleCancelInvite = (inviteId?: bigint) => {
    if (!inviteId) return;

    revokeInviteMutation({
      inviteId: inviteId,
    });
  };

  const handleRemoveMember = (memberId?: string) => {
    if (!memberId) return;
    // TODO: API Call to remove member
    console.log("Removing member:", memberId);
    toast.success("Member removed successfully");
  };

  const handleCreateOrg = () => {
    createOrgMutation({
      name: orgName,
    });
    setOrgName("");
  };

  const handleUpdateOrgName = () => {
    // TODO: Call API to update org name
    console.log("Updating org name to:", newOrgName);
    setNewOrgName("");
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    // TODO: Call API to change member role
    console.log("Changing role for member:", memberId, "to:", newRole);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-100 text-purple-800";
      case "Admin":
        return "bg-blue-100 text-blue-800";
      case "Member":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="h-3 w-3" />;
      case "Admin":
        return <Settings className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage this organization&apos;s settings, members, and billing
        </p>
      </div>

      {/* Current Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Current Organization
          </CardTitle>
          <CardDescription>
            Information about your current organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Organization Name
              </label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {userInfo?.currentOrganization?.name}
                </p>
                {isDefaultOrg && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <Building className="h-3 w-3" />
                    Default
                  </Badge>
                )}
              </div>
            </div>
            {!isDefaultOrg && (
              <>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Your Role
                  </label>
                  <div className="mt-1 flex items-center gap-1">
                    <Badge className={getRoleColor("Owner")}>
                      {getRoleIcon("Owner")}
                      {"Owner"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Members
                  </label>
                  <p className="text-lg font-semibold">12</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Plan
                  </label>
                  <p className="text-lg font-semibold">Pro</p>
                </div>
              </>
            )}
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Created
            </label>
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <p>
                {formatTimestamp(userInfo?.currentOrganization?.createdAt!)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Organization Name */}
      {!isDefaultOrg && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Update Organization Name</CardTitle>
              <CardDescription>
                Change your organization&apos;s display name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder={`Current: ${userInfo?.currentOrganization?.name}`}
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <Button
                  onClick={handleUpdateOrgName}
                  disabled={!newOrgName.trim()}
                >
                  Update Name
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Invite New Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite New Member
              </CardTitle>
              <CardDescription>
                Send an invitation to join this environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleInviteUser} disabled={!email.trim()}>
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {listUserInvitationData?.items &&
            listUserInvitationData?.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                  <CardDescription>
                    Invitations that haven&apos;t been accepted yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listUserInvitationData?.items.map((invite) => (
                      <div
                        key={invite.invitation?.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {invite.invitation?.invitedUserEmail
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {invite.invitation?.invitedUserEmail}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Invited by{" "}
                              {invite.invitation?.invitedBy?.username} •{" "}
                              {formatTimestamp(invite.invitation?.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* <Badge className={getRoleColor(invite.role)}>
                    {getRoleIcon(invite.role)}
                    {invite.role}
                  </Badge> */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelInvite(invite.invitation?.id)
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Environment Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Environment Members
              </CardTitle>
              <CardDescription>
                Users with access to this environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {listUserData?.items && listUserData?.items.length > 0 ? (
                  listUserData.items.map((member) => (
                    <div
                      key={member.user?.id?.toString()}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={gravatarURL(member.user?.email)} />
                          <AvatarFallback className="uppercase">
                            {member.user?.firstName?.slice(0, 2) || (
                              <UserIcon size={14} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user?.username || member.user?.firstName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {member.user?.email}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Joined {formatTimestamp(member.user?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor("Admin")}>
                          {getRoleIcon("Admin")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(member?.user?.id?.toString())
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No members found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
              <CardDescription>
                Manage members and their roles in this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {listUserData?.items && listUserData?.items.length > 0 ? (
                  listUserData.items.map((member) => (
                    <div
                      key={member.user?.id?.toString()}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={gravatarURL(member.user?.email)} />
                          <AvatarFallback className="uppercase">
                            {member.user?.firstName?.slice(0, 2) || (
                              <UserIcon size={14} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user?.username || member.user?.firstName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {member.user?.email}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Joined {formatTimestamp(member.user?.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor("Admin")}>
                          {getRoleIcon("Admin")}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(member?.user?.id?.toString())
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No members found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Create New Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>
            Create a new organization and become its owner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="New organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Button onClick={handleCreateOrg} disabled={!orgName.trim()}>
              Create Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* TODO: only when owner */}
          {
            <div className="flex items-center justify-between rounded-lg border border-red-200 p-3">
              <div>
                <p className="font-medium text-red-600">Delete Organization</p>
                <p className="text-muted-foreground text-sm">
                  Permanently delete this organization and all its data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Org
              </Button>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

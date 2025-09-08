"use client";

import { SettingsShell } from "@/components/settings-shell";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAllEnvironments } from "@/context/list-environments";
import { useMutation } from "@connectrpc/connect-query";
import { inviteUser } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
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
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils/formatTimeStamp";

export default function OrgSettingsPage() {
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const { userInfo } = useAllEnvironments();
  const { mutate: inviteUserMutation } = useMutation(inviteUser, {});
  const { mutate: createOrgMutation } = useMutation(createOrganization, {});

  if (userInfo === "isLoading") return;

  const isDefaultOrg =
    userInfo?.currentOrganization?.id === userInfo?.defaultOrganization?.id;

  // hardcoded org members
  const orgMembers = [
    {
      id: "1",
      name: "dumibell",
      email: "choyejee14@gmail.com",
      role: "Owner",
      joinedAt: "2024-01-15",
      avatar: null,
    },
    {
      id: "2",
      name: "aybabtme",
      email: "antoine@webscale.lol",
      role: "Admin",
      joinedAt: "2024-02-01",
      avatar: null,
    },
  ];

  // hardcoded pending invites
  const pendingInvites = [
    {
      id: "inv-1",
      email: "john@example.com",
      role: "Member",
      invitedAt: "2024-03-10",
      invitedBy: "dumibell",
    },
    {
      id: "inv-2",
      email: "sarah@example.com",
      role: "Admin",
      invitedAt: "2024-03-12",
      invitedBy: "dumibell",
    },
  ];

  const handleInviteUser = () => {
    inviteUserMutation({
      userEmail: email,
    });
    setEmail("");
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

  const handleRemoveMember = (memberId: string) => {
    // TODO: Call API to remove member
    console.log("Removing member:", memberId);
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    // TODO: Call API to change member role
    console.log("Changing role for member:", memberId, "to:", newRole);
  };

  const handleCancelInvite = (inviteId: string) => {
    // TODO: Call API to cancel invite
    console.log("Cancelling invite:", inviteId);
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
    <SettingsShell activeSection="organization">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization settings, members, and billing
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
            {/* Invite Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invite New Member
                </CardTitle>
                <CardDescription>
                  Send an invitation to join your organization
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
            {pendingInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                  <CardDescription>
                    Invitations that haven&apos;t been accepted yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {invite.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <p className="text-muted-foreground text-sm">
                              Invited by {invite.invitedBy} •{" "}
                              {new Date(invite.invitedAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(invite.role)}>
                            {getRoleIcon(invite.role)}
                            {invite.role}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
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

            {/* Organization Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organization Members
                </CardTitle>
                <CardDescription>
                  Manage members and their roles in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orgMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {member.email}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Joined{" "}
                            {new Date(member.joinedAt).toLocaleDateString(
                              "ko-KR",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        {member.role !== "Owner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <p className="font-medium text-red-600">
                    Delete Organization
                  </p>
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
    </SettingsShell>
  );
}

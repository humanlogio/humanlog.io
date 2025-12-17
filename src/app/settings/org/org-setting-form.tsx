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
import { useEffect, useState } from "react";
import {
  Trash2,
  Crown,
  Settings,
  Mail,
  Calendar,
  Users,
  Building,
  UserIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { gravatarURL } from "@/lib/utils/avatar";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member, Invitation, Organization } from "better-auth/plugins";
import { User } from "better-auth";
import { useRouter } from "next/navigation";

interface Role {
  value: "owner" | "admin" | "member";
  label: string;
}

const ROLES: Role[] = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "member",
    label: "Member",
  },
];

interface OrganizationWithDetails extends Organization {
  members: (Member & {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | undefined;
    };
  })[];
  invitations: Invitation[];
}

interface OrgSettingFormProps {
  activeOrganization: OrganizationWithDetails;
  user: User;
}

export const OrgSettingForm = ({
  activeOrganization,
  user,
}: OrgSettingFormProps) => {
  const router = useRouter();
  const { organization, useListOrganizations } = authClient;
  const { data: allOrganizations } = useListOrganizations();

  const isLastOrganization = !!(
    allOrganizations && allOrganizations.length <= 1
  );

  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [role, setRole] = useState<Role>();
  const [isDeletingOrg, setIsDeletingOrg] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    [],
  );
  const metadata = JSON.parse(activeOrganization?.metadata);
  const isOwner = user.id === metadata?.createdBy;

  const handleSetRole = (value: string) => {
    const role = ROLES.find((role) => role.value === value);
    if (!role) return;
    setRole(role);
  };

  const handleInviteUser = async () => {
    if (!activeOrganization) {
      toast.error("No active organization found");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    await organization.inviteMember(
      {
        email,
        role: role.value,
        organizationId: activeOrganization.id || "",
        resend: true,
      },
      {
        onSuccess: () => {
          toast.success("User invitation sent successfully");
          setEmail("");
        },
        onError: (error) => {
          toast.error("Failed to send invitation");
          console.error(error);
        },
      },
    );
  };

  const handleCancelInvite = async (inviteId?: string) => {
    if (!inviteId) return;

    await organization.cancelInvitation(
      {
        invitationId: inviteId,
      },
      {
        onSuccess: (ctx) => {
          console.log("ctx", ctx);
          toast.success(`${ctx.data.email} invitation cancelled successfully`);
        },
        onError: (error) => {
          toast.error("Failed to cancel invitation");
          console.error(error);
        },
      },
    );
  };

  const handleRemoveMember = async (memberId?: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) return;
    if (!memberId) return;
    await organization.removeMember(
      {
        memberIdOrEmail: memberId, // required
        organizationId: activeOrganization?.id || "",
      },
      {
        onSuccess: () => {
          toast.success("Member removed successfully");
        },
        onError: (error) => {
          toast.error("Failed to remove member");
          console.error(error);
        },
      },
    );
  };

  const handleCreateOrg = async () => {
    await organization.create(
      {
        slug: orgName,
        name: orgName,
        userId: user?.id?.toString(),
        keepCurrentActiveOrganization: true,
        metadata: {
          createdBy: user?.id?.toString(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Organization created successfully");
          setOrgName("");
        },
        onError: (error) => {
          toast.error("Failed to create organization");
          console.error(error);
        },
      },
    );
  };

  const handleUpdateOrgName = async () => {
    await organization.update(
      {
        data: {
          name: newOrgName,
          slug: newOrgName,
        },
      },
      {
        onSuccess: () => {
          toast.success("Organization name updated successfully");
          setNewOrgName("");
        },
        onError: (error) => {
          toast.error("Failed to update organization name");
          console.error(error);
        },
      },
    );
  };

  const handleDeleteOrg = async () => {
    if (isLastOrganization) {
      toast.error(
        "Cannot delete your last organization. Create a new organization before deleting this one.",
      );
      return;
    }
    setIsDeletingOrg(true);
    await organization.delete(
      {
        organizationId: activeOrganization?.id,
      },
      {
        onSuccess: async () => {
          toast.success("Organization deleted successfully");

          const remainingOrgs = allOrganizations?.filter(
            (org) => org.id !== activeOrganization?.id,
          );

          if (!remainingOrgs || remainingOrgs.length === 0) return;

          await organization.setActive({
            organizationId: remainingOrgs[0].id,
          });
          toast.info(`Switched to ${remainingOrgs[0].name}`);
          router.refresh();

          setIsDeletingOrg(false);
        },
        onError: (error) => {
          toast.error(`Failed to delete organization: ${error.error.message}`);
          console.error(error);
          setIsDeletingOrg(false);
        },
      },
    );
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    // TODO: Call API to change member role
    console.log("Changing role for member:", memberId, "to:", newRole);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
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

  useEffect(() => {
    if (!activeOrganization?.invitations) return;
    setPendingInvitations(
      activeOrganization.invitations.filter(
        (invite) => invite.status === "pending",
      ),
    );
  }, [activeOrganization]);

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
                  {activeOrganization?.name}
                </p>
                {/* {isDefaultOrg && (
                <Badge className="bg-orange-100 text-orange-800">
                  <Building className="h-3 w-3" />
                  Default
                </Badge>
              )} */}
              </div>
            </div>
            {
              <>
                {/* TODO: later....... */}
                {/* <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Your Role
                </label>
                <div className="mt-1 flex items-center gap-1">
                  <Badge className={getRoleColor("Owner")}>
                    {getRoleIcon("Owner")}
                    {"Owner"}
                  </Badge>
                </div>
              </div> */}
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Members
                  </label>
                  <p className="text-lg font-semibold">
                    {activeOrganization?.members?.length}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Plan
                  </label>
                  <p className="text-lg font-semibold">Pro</p>
                </div>
              </>
            }
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Created
            </label>
            <div className="mt-1 flex items-center gap-1">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <p>{activeOrganization?.createdAt.toDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Organization Name */}
      {
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
                  placeholder={`Current: ${activeOrganization?.name}`}
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
                <Select value={role?.value} onValueChange={handleSetRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ROLES.map((role) => {
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button onClick={handleInviteUser} disabled={!email.trim()}>
                  Send Invite
                </Button>
              </div>
            </CardContent>

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Invitations
                  </CardTitle>
                  <CardDescription>
                    Invitations that haven&apos;t been accepted yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingInvitations.map((invite) => (
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
                            <p className="flex gap-1 font-medium">
                              {invite.email}
                              <Badge className={getRoleColor(invite.role)}>
                                {getRoleIcon(invite.role)}
                                {invite.role}
                              </Badge>
                            </p>
                            {/* TODO: add user name */}
                            {/* <p className="text-muted-foreground text-sm">
                              Invited by
                              {invite.inviterId}
                            </p> */}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
              </>
            )}
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
                {activeOrganization?.members ? (
                  activeOrganization.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={gravatarURL(member.user?.email)} />
                          <AvatarFallback className="uppercase">
                            {member.user?.name?.slice(0, 2) || (
                              <UserIcon size={14} />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        {isOwner && member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member?.id)}
                            className="e text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
      }

      {/* Danger Zone */}
      {
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {
              <div className="flex items-center justify-between rounded-lg border border-red-200 p-3">
                <div>
                  <p className="font-medium text-red-600">
                    Delete Organization
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {isLastOrganization
                      ? "You must have at least one organization. Create another organization before deleting this one."
                      : "Permanently delete this organization and all its data"}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteOrg}
                  disabled={isDeletingOrg || isLastOrganization}
                  className="w-24"
                >
                  {isDeletingOrg ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Delete Org"
                  )}
                </Button>
              </div>
            }
          </CardContent>
        </Card>
      }
    </div>
  );
};

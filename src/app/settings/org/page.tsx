"use client";

import { SettingsShell } from "@/components/settings-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@connectrpc/connect-query";
import { inviteUser } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { useState } from "react";

export default function OrgSettingsPage() {
  const [email, setEmail] = useState("");
  const { mutate: inviteUserMutation } = useMutation(inviteUser, {});

  const handleInviteUser = () => {
    inviteUserMutation({
      userEmail: email,
    });
  };

  return (
    <SettingsShell activeSection="organization">
      <h1 className="mb-6 text-3xl font-bold">Organization Settings</h1>
      <div className="flex gap-1">
        <Input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleInviteUser}>invite user</Button>
      </div>
    </SettingsShell>
  );
}

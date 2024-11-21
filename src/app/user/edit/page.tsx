import { SettingsShell } from "@/components/settings-shell";
import { UserSettingsForm } from "@/components/user/user-settings-form";

export default function UserSettingsPage() {
  return (
    <SettingsShell activeSection="user">
      <h1 className="mb-6 text-3xl font-bold">User Settings</h1>
      <UserSettingsForm />
    </SettingsShell>
  );
}

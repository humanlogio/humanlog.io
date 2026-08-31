import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so no new environments — creating one used to
 * open a Stripe subscription (OrganizationService.CreateEnvironment). The
 * backend refuses that RPC independently; this is the front door only.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function NewEnvironmentPage() {
  return (
    <TakingABreak description="The hosted app is closed, so there are no new environments to create. The free subscriptions created at signup are being cancelled and there is nothing owed." />
  );
}

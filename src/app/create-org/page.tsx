import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so organization creation is closed.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function CreateOrgPage() {
  return (
    <TakingABreak description="The hosted app is closed, so there are no new organizations to create. The log parser is being open-sourced, and the observability tool is moving to a new project called minitape." />
  );
}

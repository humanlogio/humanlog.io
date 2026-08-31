import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so onboarding is closed.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function OnboardingCreateOrgPage() {
  return (
    <TakingABreak description="The hosted app is closed, so there’s no onboarding to finish. The log parser is being open-sourced, and the observability tool is moving to a new project called minitape." />
  );
}

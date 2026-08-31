import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so there is no plan to pick.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function OnboardingPricingPage() {
  return (
    <TakingABreak description="There’s nothing to buy — the hosted app is winding down and the free subscriptions created at signup are being cancelled." />
  );
}

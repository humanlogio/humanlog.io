import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so there are no plans to show and no checkout
 * to enter. The pricing components are left in the tree for whenever the lights
 * come back on.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function PricingPage() {
  return (
    <TakingABreak description="There’s nothing to buy — the hosted app is winding down and the free subscriptions created at signup are being cancelled. The log parser is being open-sourced, and the observability tool is moving to a new project called minitape." />
  );
}

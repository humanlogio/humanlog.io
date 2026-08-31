import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break. This used to be the live Stripe Elements
 * checkout; it must not load payment UI while the service is closed.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function PurchasePage() {
  return (
    <TakingABreak description="Checkout is closed — the hosted app is winding down and the free subscriptions created at signup are being cancelled. There is nothing owed." />
  );
}

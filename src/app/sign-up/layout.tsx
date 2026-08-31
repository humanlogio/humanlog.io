import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so we're not accepting new signups.
 *
 * The notice replaces `children` entirely rather than gating it, so every route
 * under /sign-up lands on it. The underlying pages are left in place for
 * whenever the lights come back on.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function SignUpLayout() {
  return (
    <TakingABreak description="We're not accepting new signups — the hosted app is winding down. The log parser is being open-sourced, and the observability tool is moving to a new project called minitape." />
  );
}

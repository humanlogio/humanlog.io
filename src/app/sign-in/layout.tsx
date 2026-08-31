import { TakingABreak } from "@/components/taking-a-break";

/**
 * humanlog.io is taking a break, so there is nothing to sign in to.
 *
 * The notice replaces `children` entirely rather than gating it, so every route
 * under /sign-in (including the password-reset flow) lands on it. The
 * underlying pages are left in place for whenever the lights come back on.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export default function SignInLayout() {
  return (
    <TakingABreak description="Sign-in is closed — the hosted app is winding down. The log parser is being open-sourced, and the observability tool is moving to a new project called minitape." />
  );
}

"use client";

import { useAllEnvironments } from "@/context/list-environments";
import Link from "next/link";

export default function Page() {
  const { user } = useAllEnvironments();

  // Determine if user is logged in
  const isLoggedIn = user !== "not-logged-in" && user !== "loading";

  return (
    <div
      className="container-min-h-full container flex flex-col items-center justify-center"
      aria-labelledby="support-heading"
    >
      <h1 id="support-heading" className="text-center text-3xl font-bold">
        Support
      </h1>
      <p className="text-muted-foreground mt-4 text-center">
        Need help? Wanna talk?
      </p>
      <p className="mt-2">
        <Link
          href="link/discord"
          className="text-main underline"
          aria-label="Join our Discord community for support"
        >
          Community support on Discord
        </Link>

        {isLoggedIn && (
          <>
            {" or "}
            <Link
              href="mailto:support@webscale.lol"
              className="text-main underline"
              aria-label="Contact our support team via email"
            >
              Contact us by Email
            </Link>
          </>
        )}
      </p>

      {/* TODO: link to special channel for paying customers */}
    </div>
  );
}

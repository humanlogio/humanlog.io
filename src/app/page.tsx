"use client";

import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import { usePageStore } from "@/stores/page-store";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getOrgEnvUrl } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { activeEnvironment } = useEnvironmentStore();

  const { useSession, useActiveOrganization } = authClient;
  const { data: activeOrganization } = useActiveOrganization();
  const { activePage } = usePageStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (!activeOrganization || !session) return;
    const url = getOrgEnvUrl(activeOrganization, activeEnvironment, activePage);
    router.replace(url);
  }, [session, activeOrganization, activeEnvironment, activePage, router]);

  return (
    <main className="flex flex-col items-center px-4 sm:px-6 lg:px-12 xl:px-24">
      <section className="w-full">
        <AboveFoldHero />
        <BelowFold />
      </section>
    </main>
  );
}

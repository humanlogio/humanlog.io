"use client";

import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import { usePageStore } from "@/stores/page-store";
import { useOrganizationStore } from "@/stores/user-store";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { activeEnvironment } = useEnvironmentStore();

  const { useSession, organization } = authClient;
  const { currentOrganization } = useOrganizationStore();
  const { activePage } = usePageStore();

  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    // if (user) {
    //   const url = getOrgEnvUrl(
    //     currentOrganization,
    //     activeEnvironment,
    //     activePage,
    //   );
    //   router.replace(url);
    // }
  }, [user, currentOrganization, activeEnvironment, activePage, router]);

  if (user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center px-4 sm:px-6 lg:px-12 xl:px-24">
      <section className="w-full">
        <AboveFoldHero />
        <BelowFold />
      </section>
    </main>
  );
}

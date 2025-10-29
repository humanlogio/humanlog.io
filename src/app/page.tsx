"use client";

import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePageStore } from "@/stores/page-store";

import { useUser } from "@/hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { activeEnvironment } = useEnvironmentStore();
  const { userData } = useUser();
  const { activePage } = usePageStore();

  if (userData) {
    const url = getOrgEnvUrl(userData, activeEnvironment, activePage);
    router.replace(url);
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

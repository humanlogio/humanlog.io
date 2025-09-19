"use client";

import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";
import { useAllEnvironments } from "@/context/list-environments";
import { useEnvironmentStore } from "@/stores/environment-store";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loading-indicator";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { usePage } from "@/stores/page-store";

export default function Home() {
  const router = useRouter();
  const { activeEnvironment } = useEnvironmentStore();
  const { userInfo } = useAllEnvironments();
  const { activePage } = usePage();

  if (userInfo === "isLoading") {
    return <LoadingIndicator />;
  }

  if (userInfo) {
    const url = getOrgEnvUrl(userInfo, activeEnvironment, activePage);
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

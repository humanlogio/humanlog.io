"use client";

import SetupGuide from "@/components/setup-guide";
import PreviewCode, { Demo } from "@/components/env/previewCode";
import AboveFoldHero from "@/components/landing-page/hero-marketing";

export default function Home() {
  return (
    <main>
      <section>
        {/* Above the fold hero marketing section */}
        <AboveFoldHero />
        <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
          <SetupGuide />
          <Demo />
          <PreviewCode />
        </div>
      </section>
    </main>
  );
}

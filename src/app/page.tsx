"use client";

import { Demo } from "@/components/env/previewCode";
import AboveFoldHero from "@/components/landing-page/hero-marketing";

export default function Home() {
  return (
    <main>
      <section>
        <AboveFoldHero />
        <div className="flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60"></div>
      </section>
    </main>
  );
}

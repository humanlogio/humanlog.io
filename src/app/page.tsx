"use client";

import { Demo } from "@/components/env/previewCode";
import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";

export default function Home() {
  return (
    <main>
      <section>
        <AboveFoldHero />
        <BelowFold />
      </section>
    </main>
  );
}

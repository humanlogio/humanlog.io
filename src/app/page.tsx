import AboveFoldHero from "@/components/landing-page/hero-marketing";
import BelowFold from "@/components/landing-page/below-fold";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 sm:px-6 lg:px-12 xl:px-24">
      <section className="w-full">
        <AboveFoldHero />
        <BelowFold />
      </section>
    </main>
  );
}

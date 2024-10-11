"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PricingPlan from "@/components/pricing-plan";

const tiers = [
  {
    name: "LocalDev",
    id: "0",
    href: "/subscribe?plan=localdev",
    price: { "1": "$19", "2": "$14" },
    discountPrice: { "1": "", "2": "$199" },
    description: `Save and explore your local development logs.`,
    features: [
      `Single user`,
      `Single machine`,
      `500 GiB of history included`,
      `30 days retention`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Get started`,
  },
  {
    name: "Team",
    id: "1",
    href: "/subscribe?plan=team",
    price: { "1": "$49", "2": "$38" },
    discountPrice: { "1": "", "2": "$499" },
    description: `When you grow, need more power and flexibility.`,
    features: [
      `All in LocalDev, plus`,
      `Teams`,
      `Any number of machines`,
      `1 TiB of history included`,
      `100 days retention`,
    ],
    featured: true,
    highlighted: false,
    soldOut: false,
    cta: `Get started`,
  },
  {
    name: "Enterprise Custom",
    id: "2",
    href: "/contact-us",
    price: "",
    discountPrice: { "1": "Custom", "2": "Custom" },
    description: `Custom plans for your needs.`,
    features: [
      `All in Teams, plus`,
      `Single Sign-on`,
      `Custom history`,
      `Custom environments`,
      `Bring your own bucket`,
      `Bring your own cloud`,
      `Priority support`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Contact us`,
  },
];

export default function Page() {
  const [isAnnually, setIsAnnually] = useState(true);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] w-full flex-col items-center justify-center bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center px-4 py-8">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <div className="flex flex-none flex-row items-center gap-2 pt-8">
          <Label
            htmlFor="annualy"
            className={cn("transition-colors duration-200", {
              "text-slate-500": isAnnually,
            })}
          >
            Billed Monthly
          </Label>
          <Switch
            id="annualy"
            checked={isAnnually}
            onCheckedChange={(checked) => setIsAnnually(checked)}
          />
          <Label
            htmlFor="annualy"
            className={cn("transition-colors duration-200", {
              "text-slate-500": !isAnnually,
            })}
          >
            Billed Annually
          </Label>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 pt-16 lg:grid-cols-3">
          {tiers.map((tier) => (
            <PricingPlan
              key={tier.id}
              name={tier.name}
              featured={tier.featured}
              price={isAnnually ? tier.price["2"] : tier.price["1"]}
              description={tier.description}
              features={tier.features}
              cta={tier.cta}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

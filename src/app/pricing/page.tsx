"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { tiers } from "@/lib/pricingDataFake";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PricingPlan from "@/components/pricing-plan";

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

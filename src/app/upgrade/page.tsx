"use client";

import { useState } from "react";
import { Building, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { tiers } from "@/lib/pricingDataFake";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const isSelected = true;

export default function Page() {
  const [isBilledMonthly, setIsBilledMonthly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="mx-auto min-h-[calc(100dvh-56px)] w-full max-w-screen-xl px-4 py-8">
      <h1 className="text-4xl font-bold">Create a new environment</h1>

      {/* form instructions https://ui.shadcn.com/docs/components/select#form */}
      <div className="mt-6 flex flex-col items-stretch gap-4 md:flex-row">
        <div className="flex flex-col gap-2">
          <Label htmlFor="" className="text-lg font-bold">
            Organization
          </Label>
          <Select>
            <SelectTrigger className="min-w-80">
              <div className="flex flex-row items-center gap-2">
                <Building size={16} />
                <SelectValue placeholder="Select an organization" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="defaultOrg1" key={1}>
                  defaultOrg1
                </SelectItem>
                <SelectItem value="defaultOrg2" key={2}>
                  defaultOrg2
                </SelectItem>
                <SelectSeparator />
                <SelectItem value="createNew" key={3}>
                  + Create new
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden items-center md:flex">
          <span className="mt-2 text-2xl font-bold">/</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="" className="text-lg font-bold">
            Environment name
          </Label>
          <Input className="w-full" placeholder="Name your new environment" />
          <span className="-mt-1 text-sm text-slate-500">
            Lowercase alphanumeric characters, dashes, and underscores only
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-row items-center justify-between gap-6">
          <Label htmlFor="" className="text-lg font-bold">
            Pick a plan
          </Label>
          <div className="flex flex-row items-center gap-2">
            <Switch
              id="billed-monthly"
              checked={isBilledMonthly}
              onCheckedChange={(checked) => setIsBilledMonthly(checked)}
            />
            <Label
              htmlFor="billed-monthly"
              className={cn("transition-colors duration-200", {
                "text-slate-500": !isBilledMonthly,
              })}
            >
              Billed Monthly
            </Label>
          </div>
        </div>

        {/* Dynamic Plan Cards */}
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier) => {
            const isSelected = selectedPlan === tier.id;
            const price = isBilledMonthly ? tier.price["1"] : tier.price["2"];

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedPlan(tier.id)}
                className={cn(
                  "cursor-pointer rounded-md border-2 border-border p-6 shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:shadow-dark dark:hover:shadow-none",
                  isSelected &&
                    "translate-x-boxShadowX translate-y-boxShadowY bg-main shadow-none",
                )}
              >
                <div className="flex flex-row items-center justify-between gap-6">
                  <div className="rounded-base bg-slate-200 px-2 py-0.5 font-bold dark:bg-slate-950">
                    {tier.name}
                  </div>
                  <h5 className="font-bold">
                    <span
                      className={isSelected ? "text-white" : "text-success"}
                    >
                      {price || "Custom"}
                    </span>
                    {price && "/month"}
                  </h5>
                </div>
                <p
                  className={cn(
                    "mt-4 text-sm text-slate-500",
                    isSelected && "text-white",
                  )}
                >
                  {tier.description}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="shrink-0" size={18} /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* payment */}
      <div className="mt-6 grid-cols-3 gap-4 md:grid">
        <div className="col-span-2">
          <Label htmlFor="" className="text-lg font-bold">
            Payment
          </Label>
          <div className="mt-3 flex flex-row items-center justify-between gap-6 rounded-base border-2 border-warning bg-warning/30 p-4 dark:border-warning/50 dark:bg-warning/10">
            <p>Please add a credit card for this organization.</p>
            <Button variant="noShadowNeutral">Add card</Button>
          </div>
        </div>
      </div>

      {/* create */}
      <div className="mt-6 grid-cols-3 gap-4 md:grid">
        <div className="col-span-2">
          <Label htmlFor="" className="text-lg font-bold">
            Create a new environment
          </Label>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Button>Create environment</Button>
            <div className="flex flex-col gap-1">
              <span className="font-bold">
                Monthly cost: <span className="text-success">$999</span>
              </span>
              <p className="text-sm text-slate-500">
                Your first payment of $19 will be charged today.
                <br />
                Subsequent monthly charges will occur every 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

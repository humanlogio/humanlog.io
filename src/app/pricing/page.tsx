"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { Product as APIProduct } from "api/js/types/v1/product_pb";
import { Price as APIPrice } from "api/js/types/v1/price_pb";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Product {
  product: APIProduct;
  prices: APIPrice[];
}

export default function Page() {
  const [isBilledYearly, setIsBilledYearly] = useState(true);

  // fetch the product list
  const listProductRes = useQuery(listProduct, { category: "logging" });

  // clean it up into ergonomic types
  const products = listProductRes.data?.items.map((el): Product => {
    return { product: el.product!, prices: el.prices };
  });

  console.log(products);

  return (
    <div className="container-h-full flex w-full flex-col items-center justify-center bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="container flex flex-col items-center justify-center py-8">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <div className="flex flex-none flex-row items-center gap-2 pt-8">
          <Label
            htmlFor="billed-monthly"
            className={cn("transition-colors duration-200", {
              "text-slate-500": isBilledYearly,
            })}
          >
            Billed Monthly
          </Label>
          <Switch
            id="billed-monthly"
            checked={isBilledYearly}
            onCheckedChange={setIsBilledYearly}
          />
          <Label
            htmlFor="billed-monthly"
            className={cn("transition-colors duration-200", {
              "text-slate-500": !isBilledYearly,
            })}
          >
            Billed Annually
          </Label>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 pt-16 lg:grid-cols-3">
          {products?.map((product) => {
            const monthly = product.prices.find(
              (p) => p.lookupKey === "localdev_pro_monthly",
            );
            const yearly = product.prices.find(
              (p) => p.lookupKey === "localdev_pro_yearly",
            );
            const price = isBilledYearly
              ? Number(yearly?.unitAmount || 0) / 100
              : Number(monthly?.unitAmount || 0) / 100;

            // to replace with stripe data
            const featured = true;

            return (
              <div
                key={product.product.stripeId}
                className="flex flex-col justify-between rounded-base border-2 border-border bg-white p-6 dark:border-darkBorder dark:bg-darkBg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {product.product.name}
                    </h3>
                    {featured && (
                      <span className="rounded-base border-2 border-border bg-success px-2 py-0.5 text-sm text-text dark:border-darkBorder">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="mb-3 mt-2 text-slate-500">
                    {product.product.description}
                  </p>
                  <div>
                    <span className="text-3xl font-bold">
                      {price ? `$${price.toFixed(2)}` : "Custom"}
                    </span>
                    {price && isBilledYearly ? (
                      <span>/year</span>
                    ) : (
                      <span>/month</span>
                    )}
                  </div>
                  <ul className="mt-8 flex flex-col gap-2">
                    {product.product.marketingFeatures.map((feature) => {
                      return (
                        <li
                          key={feature.name}
                          className="flex items-center gap-3"
                        >
                          <Check className="shrink-0" size={18} />{" "}
                          {feature.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Button
                  size={featured ? "lg" : "default"}
                  className={cn("mt-12 w-full", featured && "bg-success")}
                >
                  {price ? "Get Started" : "Contact Us"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

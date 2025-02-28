"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { Product as APIProduct } from "api/js/types/v1/product_pb";
import { Price as APIPrice } from "api/js/types/v1/price_pb";
import { Check, Loader } from "lucide-react";

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
  const router = useRouter();

  // fetch the product list
  const { isLoading, data } = useQuery(listProduct, { category: "logging" });

  // clean it up into ergonomic types
  const products = data?.items.map((el): Product => {
    return { product: el.product!, prices: el.prices };
  });
  const defaultProduct = data?.defaultProduct;

  return (
    <div className="flex w-full grow flex-col items-center justify-center bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="container flex flex-col items-center justify-center py-8">
        {isLoading ? (
          <Loader className="animate-spin" />
        ) : (
          <>
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
                className={cn("relative transition-colors duration-200", {
                  "text-slate-500": !isBilledYearly,
                })}
              >
                Billed Yearly
                <span
                  className={cn(
                    "absolute left-full top-1/2 ml-2 hidden -translate-y-1/2 transform text-nowrap rounded-base bg-success px-2 py-1 text-xs font-bold text-white transition-colors duration-200 sm:block",
                    {
                      "bg-slate-400": !isBilledYearly,
                    },
                  )}
                >
                  SAVE 20%
                </span>
              </Label>
            </div>

            <div
              className={cn(
                "grid w-full grid-cols-1 gap-8 pt-16",
                products?.length === 1
                  ? "place-items-center" // Center a single item
                  : "lg:grid-cols-2 xl:grid-cols-4",
              )}
            >
              {products?.map((product) => {
                const ctaLink = product.product.ctaLink;

                const monthly = product.prices.find(
                  (p) => p.recurring?.interval === "month",
                );
                const yearly = product.prices.find(
                  (p) => p.recurring?.interval === "year",
                );

                const price = isBilledYearly ? yearly : monthly;
                const displayPrice = isBilledYearly
                  ? Number(yearly?.unitAmount || 0) / 100 / 12
                  : Number(monthly?.unitAmount || 0) / 100;

                // to replace with stripe data
                const featured =
                  product.product.stripeId == defaultProduct?.stripeId;

                let ctaMessage = `Get ${product.product.name}`;
                let onCtaClick = () => {};
                switch (ctaLink) {
                  case "personal_use":
                    ctaMessage = "Go!";
                    onCtaClick = () => {
                      router.push(`/localhost`);
                    };
                    break;
                  case "checkout_localhost":
                    ctaMessage = `Get ${product.product.name}`;
                    onCtaClick = () => {
                      router.push(
                        `/user/purchase?plan=${product.product.stripeId}`,
                      );
                    };
                    break;
                  case "create_env":
                    ctaMessage = `Create an environment`;
                    onCtaClick = () => {
                      router.push(`/env/new?plan=${product.product.stripeId}`);
                    };
                    break;
                  case "contact_us":
                    ctaMessage = "Contact us";
                    onCtaClick = () => {
                      window.location.href = "mailto:support@webscale.lol";
                    };
                    break;
                }

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
                      <div className="flex items-center gap-4">
                        {displayPrice && isBilledYearly ? (
                          <span className="text-2xl font-bold text-slate-500 line-through">
                            ${Number(monthly?.unitAmount || 0) / 100}
                          </span>
                        ) : null}
                        <div>
                          <span className="text-3xl font-bold">
                            {displayPrice
                              ? `$${(Math.floor(displayPrice * 100) / 100).toFixed(2)}`
                              : "Custom"}
                          </span>
                          {displayPrice ? <span>/month</span> : null}
                        </div>
                      </div>
                      <ul className="mt-8 flex flex-col gap-2">
                        {product.product.marketingFeatures.map((feature) => {
                          return (
                            <li
                              key={feature.name}
                              className="flex items-center gap-3"
                            >
                              <Check className="shrink-0" size={18} />{" "}
                              <ReactMarkdown>{feature.name}</ReactMarkdown>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <Button
                      size={featured ? "lg" : "default"}
                      className={cn("mt-12 w-full", featured && "bg-success")}
                      onClick={onCtaClick}
                    >
                      {ctaMessage}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

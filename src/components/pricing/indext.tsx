"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Check, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListProductResponse_ListItem } from "api/js/svc/product/v1/service_pb";
import { Product } from "api/js/types/v1/product_pb";

interface PricingProps {
  isLoading: boolean;
  defaultProduct?: Product;
  products?: ListProductResponse_ListItem[];
}

export default function Pricing({
  isLoading,
  defaultProduct,
  products,
}: PricingProps) {
  const [isBilledYearly, setIsBilledYearly] = useState(true);
  const router = useRouter();

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
                  "text-muted-foreground": isBilledYearly,
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
                  "text-muted-foreground": !isBilledYearly,
                })}
              >
                Billed Yearly
                <Badge
                  className={cn(
                    "absolute top-1/2 left-full ml-2 hidden -translate-y-1/2 transform rounded-md bg-green-500 font-bold transition-colors duration-200 sm:block",
                    {
                      "bg-slate-400": !isBilledYearly,
                    },
                  )}
                >
                  SAVE 20%
                </Badge>
              </Label>
            </div>

            <div
              className={cn(
                "mx-auto grid w-full justify-center gap-4 pt-16",
                products?.length === 1
                  ? "max-w-xs place-items-center" // Center a single item
                  : products?.length === 2
                    ? "mx-auto max-w-3xl grid-cols-1 md:grid-cols-2" // 2 items centered
                    : products?.length === 3
                      ? "mx-auto max-w-5xl grid-cols-1 md:grid-cols-3" // 3 items in 3 columns
                      : "mx-auto max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4", // 4 or more items
              )}
            >
              {products?.map((product) => {
                const ctaLink = product?.product?.ctaLink;

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
                  product?.product?.stripeId == defaultProduct?.stripeId;

                let ctaMessage = `Get ${product?.product?.name}`;
                let onCtaClick = () => {};
                switch (ctaLink) {
                  case "personal_use":
                    ctaMessage = "Go!";
                    onCtaClick = () => {
                      router.push(
                        `/user/purchase?plan=${product?.product?.stripeId}`,
                      );
                    };
                    break;
                  case "checkout_localhost":
                    ctaMessage = `Get ${product?.product?.name}`;
                    onCtaClick = () => {
                      router.push(
                        `/user/purchase?plan=${product?.product?.stripeId}`,
                      );
                    };
                    break;
                  case "create_env":
                    ctaMessage = `Create an environment`;
                    onCtaClick = () => {
                      router.push(
                        `/env/new?plan=${product?.product?.stripeId}`,
                      );
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
                    key={product?.product?.stripeId}
                    className="flex flex-col justify-between rounded-md border bg-white p-4 dark:bg-neutral-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">
                          {product?.product?.name}
                        </h3>
                        {featured && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-500"
                          >
                            Most popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-2 mb-3">
                        {product?.product?.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between">
                        {displayPrice && isBilledYearly ? (
                          <span className="text-muted-foreground text-2xl font-bold line-through">
                            ${Number(monthly?.unitAmount || 0) / 100}
                          </span>
                        ) : null}
                        <div>
                          <span className="text-3xl font-bold">
                            {displayPrice ||
                            product.product?.ctaLink === "personal_use"
                              ? `$${(Math.floor(displayPrice * 100) / 100).toFixed(2)}`
                              : "Custom"}
                          </span>
                          {displayPrice ? <span>/month</span> : null}
                        </div>
                      </div>
                      <ul className="mt-8 flex flex-col gap-2">
                        {product?.product?.marketingFeatures.map((feature) => {
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
                      className={cn("mt-12 w-full", featured && "bg-green-500")}
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

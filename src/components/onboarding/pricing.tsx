"use client";

import { useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import Pricing from "@/components/pricing/indext";

export default function OnboardingPricing() {
  const { isLoading, data } = useQuery(listProduct, { category: "logging" });

  const products = data?.items.filter((item) => {
    return (
      item.product?.ctaLink === "personal_use" ||
      item.product?.ctaLink === "checkout_localhost"
    );
  });

  return (
    <Pricing
      isLoading={isLoading}
      defaultProduct={data?.defaultProduct}
      products={products}
    />
  );
}

"use client";

import { useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import Pricing from "@/components/pricing";

export default function Page() {
  const { isLoading, data } = useQuery(listProduct, { category: "logging" });

  return (
    <Pricing
      isLoading={isLoading}
      defaultProduct={data?.defaultProduct}
      products={data?.items}
    />
  );
}

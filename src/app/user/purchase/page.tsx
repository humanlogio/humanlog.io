"use client";

import {
  ProductPane,
  TotalPriceSummary,
} from "@/components/env/env-creation-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ConnectError } from "@connectrpc/connect";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  createAddonSubscription,
  createStripeCustomerSession,
  getStripePublishableKey,
} from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import {
  CreateAddonSubscriptionRequest,
  CreateAddonSubscriptionResponse,
} from "api/js/svc/organization/v1/service_pb";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { Price as APIPrice } from "api/js/types/v1/price_pb";
import {
  Product as APIProduct,
  Product_Scope,
} from "api/js/types/v1/product_pb";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Product {
  product: APIProduct;
  prices: APIPrice[];
}

export default function UserAddonsPage() {
  const searchParams = useSearchParams();
  const urlPlanId = searchParams.get("plan");
  const [isBilledYearly, setIsBilledYearly] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [price, setPrice] = useState<APIPrice>();
  const [stripePromise, setStripePromise] = useState<
    Promise<Stripe | null> | undefined
  >();

  const stripeClientSecret = useQuery(createStripeCustomerSession).data
    ?.customerSessionClientSecret;
  const stripePK = useQuery(getStripePublishableKey).data?.stripePublishableKey;

  // fetch the product list, set the defaults
  const listProductRes = useQuery(listProduct, {
    category: "logging",
    scope: Product_Scope.Organization,
  }).data;
  const products = listProductRes?.items
    .filter((el) => {
      return (
        el.product?.scope == Product_Scope.Organization && el.prices.length > 0
      );
    })
    .map((el): Product => {
      return { product: el.product!, prices: el.prices };
    });

  useMemo(() => {
    if (selectedProduct || !listProductRes || !listProductRes.defaultProduct) {
      return;
    }
    if (products?.length == 1) {
      setSelectedProduct(products[0]);
      return;
    }
    const defaultProduct = listProductRes.defaultProduct;
    let item = listProductRes.items
      .filter((el) => {
        return el.product?.scope == Product_Scope.Organization;
      })
      .find((el) => el.product?.stripeId === defaultProduct.stripeId);
    item && setSelectedProduct({ product: item.product!, prices: item.prices });
  }, [products, listProductRes, selectedProduct]);
  useMemo(() => {
    if (!selectedProduct) {
      setPrice(listProductRes?.defaultProduct?.defaultPrice);
      return;
    }
    const selectedPrice = selectedProduct.prices.find((p) => {
      if (isBilledYearly && p.lookupKey.includes("yearly")) {
        return true;
      }
      if (!isBilledYearly && p.lookupKey.includes("monthly")) {
        return true;
      }
      return false;
    });
    setPrice(selectedPrice);
  }, [
    isBilledYearly,
    selectedProduct,
    listProductRes?.defaultProduct?.defaultPrice,
  ]);

  useMemo(() => {
    if (selectedProduct || !listProductRes) return;

    const defaultProduct = urlPlanId
      ? listProductRes.items.find((el) => el.product?.stripeId === urlPlanId)
      : listProductRes.items.find(
          (el) =>
            el.product?.stripeId === listProductRes.defaultProduct?.stripeId,
        );

    defaultProduct &&
      setSelectedProduct({
        product: defaultProduct.product!,
        prices: defaultProduct.prices,
      });
  }, [listProductRes, selectedProduct, urlPlanId]);

  useMemo(() => {
    if (!stripePK) {
      return;
    }
    setStripePromise(loadStripe(stripePK));
  }, [stripePK]);

  if (!stripePromise || !price || !products) {
    return <Loader className="animate-spin" />;
  }

  return (
    <div className="container-h-full container py-6">
      <h1 className="mb-6 text-3xl font-bold">Subscribe</h1>
      <Elements
        stripe={stripePromise}
        options={{
          customerSessionClientSecret: stripeClientSecret,
          mode: "subscription",
          amount: Number(price.unitAmount),
          currency: price.currency,
          paymentMethodCreation: "manual",
          appearance: {
            variables: {
              colorPrimary: "rgba(136, 170, 238, 1)",
              fontSizeBase: "14px",
            },
          },
        }}
      >
        <CheckoutForm
          isBilledYearly={isBilledYearly}
          setIsBilledYearly={setIsBilledYearly}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          price={price}
          setPrice={setPrice}
          products={products}
        />
      </Elements>
    </div>
  );
}

const formSchema = z.object({});

function CheckoutForm({
  selectedProduct,
  setSelectedProduct,
  price,
  setPrice,
  isBilledYearly,
  setIsBilledYearly,
  products,
}: {
  selectedProduct: Product | undefined;
  setSelectedProduct: Dispatch<SetStateAction<Product | undefined>>;
  price: APIPrice | undefined;
  setPrice: Dispatch<SetStateAction<APIPrice | undefined>>;
  isBilledYearly: boolean;
  setIsBilledYearly: Dispatch<SetStateAction<boolean>>;
  products: Product[];
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleError = (error: string) => {
    setLoading(false);
    setErrorMessage(error);
  };

  const createAddonSubscriptionMutation = useMutation(createAddonSubscription);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("uh??");
    if (!stripe || !elements || !price) {
      return;
    }
    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      handleError(submitError.message!);
      return;
    }
    const { error, confirmationToken } = await stripe.createConfirmationToken({
      elements,
    });
    if (error) {
      handleError(error.message!);
      return;
    }

    let res: CreateAddonSubscriptionResponse;
    try {
      res = await createAddonSubscriptionMutation.mutateAsync({
        payment: {
          case: "stripe",
          value: {
            confirmationToken: confirmationToken.id,
            priceId: price?.stripeId,
          },
        },
      });
    } catch (e) {
      if (e instanceof ConnectError) {
        handleError(e.message);
      } else {
        handleError("an unexpected problem occured");
        throw e;
      }
      return;
    }
    switch (res.payment.case) {
      case "stripe":
        if (res.payment.value.status === "requires_action") {
          const { error } = await stripe.handleNextAction({
            clientSecret: res.payment.value.clientSecret,
          });
          if (error) {
            handleError(error.message!);
            return;
          }
        }
    }
    console.log("checkout completed!");
    router.push(`/user/purchase/success`);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div>
          <div className="flex flex-row items-center justify-between gap-6">
            <FormLabel>Pick a product</FormLabel>
            <div className="flex flex-row items-center gap-2">
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
                Billed Yearly
                <span
                  className={cn(
                    "ml-2 rounded-base bg-success px-2 py-1 text-xs font-bold text-white transition-colors duration-200",
                    {
                      "bg-slate-400": !isBilledYearly,
                    },
                  )}
                >
                  SAVE 20%
                </span>
              </Label>
            </div>
          </div>

          {/* Product Section */}

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const stripeID = product.product.stripeId;
              const isSelected = selectedProduct?.product.stripeId === stripeID;
              return (
                <ProductPane
                  key={stripeID}
                  product={product}
                  isSelected={isSelected}
                  isBilledYearly={isBilledYearly}
                  onClick={(price: APIPrice | undefined) => {
                    setSelectedProduct(product);
                    setPrice(price);
                  }}
                />
              );
            })}
          </div>
        </div>
        {/* Payment Section */}
        <div>
          <Label>Payment</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 mt-3 rounded-base border-2 border-warning bg-warning/30 p-4 dark:border-warning/50 dark:bg-warning/10 md:col-span-1">
              <Image
                src="/images/powered-by-stripe.svg"
                alt="Powered by Stripe"
                width={112}
                height={24}
                className="mb-4"
              />
              <PaymentElement />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="col-span-2">
          <Label className="text-lg font-bold">Checkout</Label>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:gap-6">
            <Button type="submit" disabled={!stripe || !price || loading}>
              Buy!
            </Button>
            <div className="flex flex-col gap-1">
              {/* Find the selected product */}
              {price && (
                <TotalPriceSummary
                  price={price}
                  isBilledYearly={isBilledYearly}
                />
              )}
            </div>
            {errorMessage && <div>{errorMessage}</div>}
          </div>
        </div>
      </form>
    </Form>
  );
}

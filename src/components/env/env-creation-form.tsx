"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Building, Check, Loader } from "lucide-react";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { listOrganization } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import {
  getStripePublishableKey,
  createStripeCustomerSession,
} from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAllEnvironments } from "@/context/list-environments";
import {
  Product as APIProduct,
  Product_Scope,
} from "api/js/types/v1/product_pb";
import { Price as APIPrice } from "api/js/types/v1/price_pb";
import Image from "next/image";
import { Organization } from "api/js/types/v1/organization_pb";
import { createEnvironment } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { CreateEnvironmentResponse } from "api/js/svc/organization/v1/service_pb";
import { ConnectError } from "@connectrpc/connect";

const formSchema = z.object({
  environmentName: z
    .string()
    .min(1, "Environment name is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase alphanumeric characters, dashes, and underscores allowed",
    ),
  plan: z.string().min(1, "Please select a plan"),
});

type FormValues = z.infer<typeof formSchema>;
interface EnvironmentCreationFormProps {
  orgId: string | null;
}

interface Product {
  product: APIProduct;
  prices: APIPrice[];
}

export function EnvironmentCreationForm({
  orgId,
}: EnvironmentCreationFormProps) {
  const searchParams = useSearchParams();
  const urlPlanId = searchParams.get("plan");

  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [isBilledYearly, setIsBilledYearly] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [price, setPrice] = useState<APIPrice>();
  const [stripePromise, setStripePromise] = useState<
    Promise<Stripe | null> | undefined
  >();

  const organizations = useQuery(listOrganization, {
    limit: 100,
  }).data?.items.map((el) => el.organization!);

  const stripeClientSecret = useQuery(createStripeCustomerSession).data
    ?.customerSessionClientSecret;
  const stripePK = useQuery(getStripePublishableKey).data?.stripePublishableKey;
  // fetch the product list, set the defaults
  const listProductRes = useQuery(listProduct, { category: "logging" }).data;
  const products = listProductRes?.items
    .filter((el) => {
      return el.product?.scope == Product_Scope.Environment;
    })
    .map((el): Product => {
      return { product: el.product!, prices: el.prices };
    });
  useMemo(() => {
    if (selectedProduct || !listProductRes || !listProductRes.defaultProduct) {
      return;
    }
    const defaultProduct = listProductRes.defaultProduct;
    let item = listProductRes.items.find(
      (el) => el.product?.stripeId === defaultProduct.stripeId,
    );
    if (item) {
      setSelectedProduct({ product: item.product!, prices: item.prices });
    }
  }, [listProductRes, selectedProduct]);
  useMemo(() => {
    if (!selectedProduct) {
      setPrice(listProductRes?.defaultProduct?.defaultPrice);
      return;
    }
    const selectedPrice = selectedProduct.prices.find((p) => {
      if (isBilledYearly && p.recurring?.interval.includes("year")) {
        return true;
      }
      if (!isBilledYearly && p.recurring?.interval.includes("month")) {
        return true;
      }
      if (p.lookupKey === "free_personal_use") {
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
    if (!stripePK) {
      return;
    }
    setStripePromise(loadStripe(stripePK));
  }, [stripePK]);

  // Use the FormValues type in the useForm hook
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      environmentName: "",
      plan: urlPlanId || "",
    },
  });

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

  if (!stripePromise || !price) {
    return <Loader className="animate-spin" />;
  }

  return (
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
      <Form {...form}>
        <CheckoutForm
          form={form}
          isBilledYearly={isBilledYearly}
          setIsBilledYearly={setIsBilledYearly}
          products={products}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          price={price}
          setPrice={setPrice}
        />
      </Form>
    </Elements>
  );
}

export function ProductPane({
  product,
  isSelected,
  isBilledYearly,
  onClick,
}: {
  product: Product;
  isSelected: boolean;
  isBilledYearly: boolean;
  onClick: (price: APIPrice | undefined) => void;
}) {
  const monthly = product.prices.find((p) =>
    p.recurring?.interval.includes("month"),
  );
  const yearly = product.prices.find((p) =>
    p.recurring?.interval.includes("year"),
  );

  const selectedPrice = isBilledYearly ? yearly : monthly;
  const price = isBilledYearly
    ? Number(yearly?.unitAmount || 0) / 100 / 12
    : Number(monthly?.unitAmount || 0) / 100;

  return (
    <div
      onClick={() => onClick(selectedPrice)}
      className={cn(
        "border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY dark:shadow-dark cursor-pointer rounded-md border-2 p-6 hover:shadow-none dark:hover:shadow-none",
        isSelected && "bg-muted",
      )}
    >
      <div className="flex flex-row items-center justify-between gap-6">
        <div className="rounded-md bg-slate-200 px-2 py-0.5 font-bold dark:bg-slate-950">
          {product.product.name}
        </div>
        <h5 className="font-bold">
          {isBilledYearly && (
            <span className="text-muted-foreground mr-2 text-sm line-through">
              ${Number(monthly?.unitAmount || 0) / 100}
            </span>
          )}
          <span>
            {price ? `$${(Math.floor(price * 100) / 100).toFixed(2)}` : "Free"}
          </span>
          /month
        </h5>
      </div>
      <p className={cn("text-muted-foreground mt-4 text-sm")}>
        {product.product.description}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {product.product.marketingFeatures.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="shrink-0" size={18} />{" "}
            <ReactMarkdown>{feature.name}</ReactMarkdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TotalPriceSummary({
  price,
  isBilledYearly,
}: {
  price: APIPrice;
  isBilledYearly: boolean;
}) {
  const displayPriceAmount = (
    Math.floor((Number(price.unitAmount) / 100) * 100) / 100
  ).toFixed(2);

  const frequency = isBilledYearly ? "/year" : "/month";
  const chargedToday = isBilledYearly
    ? "Your first annual payment will be prorated and charged today."
    : "Your first monthly payment will be charged today.";
  const nextPayment = isBilledYearly
    ? "Subsequent annual charges will occur every 12 months."
    : "Subsequent monthly charges will occur every 30 days.";

  return (
    <>
      <span className="font-bold">
        Total cost:{" "}
        <span className="text-success">
          ${displayPriceAmount}
          <span className="text-text">{frequency}</span>
        </span>
      </span>
      <p className="text-muted-foreground text-sm">
        {chargedToday}
        <br />
        {nextPayment}
      </p>
    </>
  );
}

function CheckoutForm({
  form,
  isBilledYearly,
  setIsBilledYearly,
  products,
  selectedProduct,
  setSelectedProduct,
  price,
  setPrice,
}: {
  form: UseFormReturn<FormValues>;
  isBilledYearly: boolean;
  setIsBilledYearly: Dispatch<SetStateAction<boolean>>;
  products: Product[] | undefined;
  selectedProduct: Product | undefined;
  setSelectedProduct: Dispatch<SetStateAction<Product | undefined>>;
  price: APIPrice | undefined;
  setPrice: Dispatch<SetStateAction<APIPrice | undefined>>;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { userInfo } = useAllEnvironments();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleError = (error: string) => {
    setLoading(false);
    setErrorMessage(error);
  };

  const createEnvironmentMutation = useMutation(createEnvironment);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

    let res: CreateEnvironmentResponse;
    try {
      res = await createEnvironmentMutation.mutateAsync({
        environmentName: values.environmentName,
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
    const envName = res.environment?.name;

    if (userInfo === "isLoading") return;
    // Redirect after successful creation
    const redirectPath = `/${userInfo?.currentOrganization?.name}/${envName}/query`;

    router.push(redirectPath);
  }

  if (userInfo === "isLoading") return;
  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/*  Environment Name */}
        <div className="flex flex-col gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="environmentName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Environment name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full md:max-w-lg"
                    placeholder="Name your new environment"
                    {...field}
                  />
                </FormControl>
                <p className="text-muted-foreground -mt-1 text-xs">
                  Lowercase alphanumeric characters, dashes, and underscores
                  only
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Plan Selection */}
        <div>
          <div className="flex flex-row items-center justify-between gap-6">
            <Label>Pick a plan</Label>
            <div className="flex flex-row items-center gap-2">
              <Switch
                id="billed-monthly"
                checked={isBilledYearly}
                onCheckedChange={setIsBilledYearly}
              />
              <Label
                htmlFor="billed-monthly"
                className={cn("transition-colors duration-200", {
                  "text-muted-foreground": !isBilledYearly,
                })}
              >
                Billed Yearly
                <span
                  className={cn(
                    "ml-2 rounded-md bg-green-500 px-2 py-1 text-xs font-bold text-white transition-colors duration-200",
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

          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products?.map((product) => {
                      return (
                        <ProductPane
                          key={product.product.stripeId}
                          product={product}
                          isSelected={
                            selectedProduct?.product.stripeId ===
                            product.product.stripeId
                          }
                          isBilledYearly={isBilledYearly}
                          onClick={(price: APIPrice | undefined) => {
                            setSelectedProduct(product);
                            field.onChange(product.product.stripeId);
                            setPrice(price);
                          }}
                        />
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Section */}
        {Number(price?.unitAmount) > 0 && (
          <div>
            <Label>Payment</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-warning bg-warning/30 dark:border-warning/50 dark:bg-warning/10 col-span-3 mt-3 rounded-md border-2 p-4 md:col-span-1">
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
        )}

        {/* Submit Section */}
        <div className="col-span-2">
          <Label className="text-lg font-bold">Create a new environment</Label>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:gap-6">
            <Button type="submit" disabled={!stripe || !price || loading}>
              Create environment
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
    </>
  );
}

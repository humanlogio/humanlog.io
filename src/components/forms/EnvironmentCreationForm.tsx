"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, Check, Loader } from "lucide-react";
import { useQuery } from "@connectrpc/connect-query";
import { listProduct } from "api/js/svc/product/v1/service-ProductService_connectquery";
import { listOrganization } from "api/js/svc/user/v1/service-UserService_connectquery";
import {
  listPaymentMethod,
  getStripePublishableKey,
} from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import {
  loadStripe,
  Stripe,
  StripeConstructorOptions,
} from "@stripe/stripe-js";
import { NewOrgModal } from "@/components/organizations/NewOrgModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectSeparator,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAllEnvironments } from "@/context/listEnvironments";
import { Product as APIProduct } from "api/js/types/v1/product_pb";
import { Price as APIPrice } from "api/js/types/v1/price_pb";
import { PaymentMethod } from "api/js/types/v1/payment_method_pb";

const formSchema = z.object({
  organization: z.string().min(1, "Please select an organization"),
  environmentName: z
    .string()
    .min(1, "Environment name is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase alphanumeric characters, dashes, and underscores allowed",
    ),
  plan: z.string().min(1, "Please select a plan"),
});

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
  const router = useRouter();

  const { currentOrg, defaultOrg } = useAllEnvironments();
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [isBilledYearly, setIsBilledYearly] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<
    Promise<Stripe | null> | undefined
  >();

  const listOrgRes = useQuery(listOrganization, { limit: 100 }).data?.items.map(
    (el) => el.organization!,
  );

  // fetch the product list
  const products = useQuery(listProduct, {
    category: "logging",
  }).data?.items.map((el): Product => {
    return { product: el.product!, prices: el.prices };
  });

  const listPaymentMethodRes = useQuery(listPaymentMethod).data?.items.map(
    (el): PaymentMethod => {
      return el.paymentMethod!;
    },
  );

  const stripePK = useQuery(getStripePublishableKey).data?.stripePublishableKey;
  useMemo(() => {
    if (!stripePK) {
      return;
    }
    setStripePromise(loadStripe(stripePK));
  }, [stripePK]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: orgId || "",
      environmentName: "",
      plan: "",
    },
  });

  const handleOrganizationChange = (value: string) => {
    if (value === "createNew") {
      setIsNewOrgModalOpen(true);
      return;
    }
    form.setValue("organization", value);
  };

  const handleOrgCreated = (newOrgName: string) => {
    // Here you might want to refresh the list of organizations
    // and select the newly created one
    form.setValue("organization", newOrgName);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Add your form submission logic here
      console.log(values);

      // Redirect after successful creation
      const redirectPath = orgId
        ? `/org/${values.organization}/env/${values.environmentName}`
        : `/env/${values.environmentName}`;
      router.push(redirectPath);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  console.log("listPaymentMethodRes", listPaymentMethodRes);
  console.log("stripePK", stripePK);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Organization and Environment Name */}
        <div className="flex flex-col items-stretch gap-4 md:flex-row">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  onValueChange={handleOrganizationChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="min-w-80">
                      <div className="flex flex-row items-center gap-2">
                        <Building size={16} />
                        <SelectValue placeholder="Select an organization" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup defaultValue={defaultOrg?.name}>
                      {listOrgRes?.map((o) => {
                        console.log("o", o);
                        if (o.id === defaultOrg?.id) {
                          return (
                            <SelectItem key={o.name} value={o.name}>
                              default
                            </SelectItem>
                          );
                        }
                        return (
                          <SelectItem key={o.name} value={o.name}>
                            {o.name}
                          </SelectItem>
                        );
                      })}
                      <SelectSeparator />
                      <SelectItem value="createNew">+ Create new</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="hidden items-center md:flex">
            <span className="mt-2 text-xl font-bold">/</span>
          </div>

          <FormField
            control={form.control}
            name="environmentName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Environment name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full max-w-lg"
                    placeholder="Name your new environment"
                    {...field}
                  />
                </FormControl>
                <p className="-mt-1 text-xs text-slate-500">
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

          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {products?.map((product) => {
                      const monthly = product.prices.find((p) =>
                        p.lookupKey.includes("monthly"),
                      );
                      const yearly = product.prices.find((p) =>
                        p.lookupKey.includes("yearly"),
                      );

                      const isSelected =
                        selectedPlan === product.product.stripeId;

                      const price = isBilledYearly
                        ? Number(yearly?.unitAmount || 0) / 100 / 12
                        : Number(monthly?.unitAmount || 0) / 100;

                      return (
                        <div
                          key={product.product.stripeId}
                          onClick={() => {
                            setSelectedPlan(product.product.stripeId);
                            field.onChange(product.product.stripeId);
                          }}
                          className={cn(
                            "cursor-pointer rounded-md border-2 border-border p-6 shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:shadow-dark dark:hover:shadow-none",
                            isSelected &&
                              "translate-x-boxShadowX translate-y-boxShadowY bg-main shadow-none",
                          )}
                        >
                          <div className="flex flex-row items-center justify-between gap-6">
                            <div className="rounded-base bg-slate-200 px-2 py-0.5 font-bold dark:bg-slate-950">
                              {product.product.name}
                            </div>
                            <h5 className="font-bold">
                              {isBilledYearly && (
                                <span className="mr-2 text-sm text-slate-500 line-through">
                                  ${Number(monthly?.unitAmount || 0) / 100}
                                </span>
                              )}
                              <span
                                className={
                                  isSelected ? "text-white" : "text-success"
                                }
                              >
                                {price
                                  ? `$${(Math.floor(price * 100) / 100).toFixed(2)}`
                                  : "Custom"}
                              </span>
                              /month
                            </h5>
                          </div>
                          <p
                            className={cn(
                              "mt-4 text-sm text-slate-500",
                              isSelected && "text-white",
                            )}
                          >
                            {product.product.description}
                          </p>
                          <ul className="mt-4 flex flex-col gap-2">
                            {product.product.marketingFeatures.map(
                              (feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-3"
                                >
                                  <Check className="shrink-0" size={18} />{" "}
                                  {feature.name}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
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
        <div className="grid-cols-3 gap-4 md:grid">
          <div className="col-span-2">
            <Label>Payment</Label>
            <p>
              Please add a credit card for this organization (handled by
              Stripe).
            </p>
            <div className="mt-3 flex flex-row items-center justify-between gap-6 rounded-base border-2 border-warning bg-warning/30 p-4 dark:border-warning/50 dark:bg-warning/10">
              {stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{ mode: "setup", currency: "usd" }}
                >
                  <PaymentElement />
                  <Button variant="noShadowNeutral" type="button">
                    Add card
                  </Button>
                </Elements>
              ) : (
                <Loader></Loader>
              )}
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="grid-cols-3 gap-4 md:grid">
          <div className="col-span-2">
            <Label className="text-lg font-bold">
              Create a new environment
            </Label>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <Button type="submit">Create environment</Button>
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

        {/* Modals */}
        <NewOrgModal
          open={isNewOrgModalOpen}
          onOpenChange={setIsNewOrgModalOpen}
          onOrgCreated={handleOrgCreated}
        />
      </form>
    </Form>
  );
}

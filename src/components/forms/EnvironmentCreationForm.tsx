"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, Check, UserMinus } from "lucide-react";
import { useApiClients } from "@/context/api-provider";
import { ListProductRequest } from "api/js/svc/product/v1/service_pb";

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
import { tiers } from "@/lib/pricingDataFake";
import { Product as APIProduct } from "api/js/types/v1/product_pb";
import { Price as APIPrice } from "api/js/types/v1/price_pb";

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
  const [isBilledMonthly, setIsBilledMonthly] = useState(true);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { apiClients, activeEnvironment, setActiveEnvironment } =
    useApiClients();

  useEffect(() => {
    (async () => {
      const req = new ListProductRequest({ category: "logging" });
      try {
        const res = await apiClients?.product.listProduct(req);
        if (!res || !res.items) {
          return;
        }
        var products = res.items.map((el): Product => {
          return {
            product: el.product!,
            prices: el.prices,
          };
        });
        setProducts(products);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organization: orgId || "",
      environmentName: "",
      plan: "",
    },
  });

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
                  onValueChange={field.onChange}
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
                    <SelectGroup>
                      <SelectItem value="defaultOrg1">defaultOrg1</SelectItem>
                      <SelectItem value="defaultOrg2">defaultOrg2</SelectItem>
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
                checked={isBilledMonthly}
                onCheckedChange={setIsBilledMonthly}
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

          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {tiers.map((tier) => {
                      const isSelected = selectedPlan === tier.id;
                      const price = isBilledMonthly
                        ? tier.price["1"]
                        : tier.price["2"];

                      return (
                        <div
                          key={tier.id}
                          onClick={() => {
                            setSelectedPlan(tier.id);
                            field.onChange(tier.id);
                          }}
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
                                className={
                                  isSelected ? "text-white" : "text-success"
                                }
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
                              <li
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <Check className="shrink-0" size={18} />{" "}
                                {feature}
                              </li>
                            ))}
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
            <div className="mt-3 flex flex-row items-center justify-between gap-6 rounded-base border-2 border-warning bg-warning/30 p-4 dark:border-warning/50 dark:bg-warning/10">
              <p>Please add a credit card for this organization.</p>
              <Button variant="noShadowNeutral" type="button">
                Add card
              </Button>
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
      </form>
    </Form>
  );
}

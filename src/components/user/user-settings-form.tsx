"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAllEnvironments } from "@/context/list-environments";
import { Loader } from "lucide-react";
import { useApiClients } from "@/context/api-provider";
import { getStripeBillingPortal } from "api/js/svc/organization/v1/service-OrganizationService_connectquery";
import { useQuery } from "@connectrpc/connect-query";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().optional(),
});

export function UserSettingsForm() {
  const { user, currentOrg, defaultOrg } = useAllEnvironments();
  const { apiClients } = useApiClients();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "" },
  });

  if (user == "not-logged-in") {
    // todo redirect to login
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        <div>You need to login!</div>
      </div>
    );
  }
  if (user == "loading") {
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        Checking user...
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!currentOrg) {
    // todo redirect to login
    return (
      <div className="container-min-h-full container flex items-center justify-center">
        <div>You need to login (org)</div>
        <Loader className="animate-spin" />
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Handle the form submission logic here
      console.log("Form submitted with values:", values);

      // Redirect or show a success message if needed
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }
  const isDefaultOrg = currentOrg.id == defaultOrg?.id;

  let billingSection = <></>;
  if (isDefaultOrg) {
    async function onClickBillingPortal() {
      try {
        const res = await apiClients?.org.getStripeBillingPortal({
          returnToUrl: window.location.href,
        });
        if (res) {
          router.push(res.portalUrl);
        }
      } catch (error) {
        console.log("failed to get stripe billing portal", error);
      }
    }
    billingSection = (
      <Button onClick={onClickBillingPortal}>Manage your subscriptions</Button>
    );
  }

  return (
    <>
      {billingSection}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Name Field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="First Name"
                    {...field}
                    required
                    value={user.firstName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Domain Field */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Last Name"
                    {...field}
                    value={user.lastName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </>
  );
}

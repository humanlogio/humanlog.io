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
import { useQuery } from "@connectrpc/connect-query";
import { getAuthURL } from "api/js/svc/auth/v1/service-AuthService_connectquery";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useApiClients } from "@/context/api-provider";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
});

interface OrgSettingsFormProps {
  orgName: string;
  defaultValues?: {
    name: string;
    domain?: string;
  };
}

export function OrgSettingsForm({
  orgName,
  defaultValues,
}: OrgSettingsFormProps) {
  const router = useRouter();
  const { user, currentOrg, defaultOrg } = useAllEnvironments();
  const { apiClients } = useApiClients();
  const { data } = useQuery(getAuthURL, {
    organization: { case: "byName", value: orgName },
    returnToUrl: window.location.href,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { name: "", domain: "" },
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

  if (currentOrg?.name != orgName) {
    if (data && data?.authUrl) {
      if (data?.authUrl != "") {
        return <Link href={data?.authUrl!}>Log in with {orgName}</Link>;
      } else {
        return <>No org with name {orgName}</>;
      }
    }
    return (
      <>
        {"Redirecting you to authenticate with org " + orgName + "..."}
        <Loader className="animate-spin" />
      </>
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

  return (
    <>
      <Button onClick={onClickBillingPortal}>Manage your subscriptions</Button>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your organization name"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Domain Field */}
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization domain (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your organization domain"
                    {...field}
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

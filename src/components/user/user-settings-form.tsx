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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConnectError } from "@connectrpc/connect";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().optional(),
});

export function UserSettingsForm() {
  const { getUserInfo, user, currentOrg, defaultOrg } = useAllEnvironments();
  const { apiClients } = useApiClients();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Initialize form with user data or empty values if user is not loaded yet
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName:
        user !== "loading" && user !== "not-logged-in"
          ? user.firstName || ""
          : "",
      lastName:
        user !== "loading" && user !== "not-logged-in"
          ? user.lastName || ""
          : "",
    },
  });

  // Watch form values to detect changes
  const watchedValues = form.watch();

  // Check if form values have changed from initial values
  useEffect(() => {
    if (user === "loading" || user === "not-logged-in") return;

    const initialValues = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    };

    const hasChanged =
      watchedValues.firstName !== initialValues.firstName ||
      watchedValues.lastName !== initialValues.lastName;

    setFormChanged(hasChanged);
  }, [watchedValues, user]);

  // Add navigation warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formChanged) {
        e.preventDefault();
        return "Changes you made may not be saved.";
      }
    };

    // Add event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formChanged]);

  // Reset form to initial values
  const handleReset = () => {
    if (user !== "loading" && user !== "not-logged-in") {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  };

  // Update form values when user data changes
  useEffect(() => {
    handleReset();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await apiClients?.user.updateUser({
        firstName: values.firstName,
        lastName: values.lastName ?? "",
      });

      toast.success("Settings updated", {
        description: "Your profile information has been updated successfully.",
      });

      // refetch user info
      getUserInfo();
    } catch (error) {
      console.error("Form submission error:", error);
      if (error instanceof ConnectError) {
        toast.error("Error", {
          description:
            error.message ?? "Failed to update settings. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Billing portal section
  const isDefaultOrg = currentOrg?.id === defaultOrg?.id;

  const handleBillingPortal = async () => {
    try {
      setIsBillingLoading(true);
      const res = await apiClients?.org.getStripeBillingPortal({
        returnToUrl: window.location.href,
      });
      if (res) {
        window.open(res.portalUrl);
      }
    } catch (error) {
      console.error("Failed to get stripe billing portal", error);
      toast.error("Error", {
        description: "Failed to access billing portal. Please try again.",
      });
    } finally {
      setIsBillingLoading(false);
    }
  };

  const billingSection = isDefaultOrg ? (
    <Button onClick={handleBillingPortal} disabled={isBillingLoading}>
      {isBillingLoading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Manage your subscriptions"
      )}
    </Button>
  ) : null;

  return (
    <div className="flex flex-col items-start gap-6">
      {/* Manage subscriptions */}
      {billingSection}

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-screen-sm flex-col gap-6"
        >
          {/* Name Field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name Field */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !formChanged}
              variant={formChanged ? "default" : "outline"}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>

            {formChanged && (
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                disabled={isSubmitting}
              >
                Discard changes
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

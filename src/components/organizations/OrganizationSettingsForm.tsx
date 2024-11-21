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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
});

interface OrganizationSettingsFormProps {
  orgId: string | null;
  defaultValues?: {
    name: string;
    domain?: string;
  };
}

export function OrganizationSettingsForm({
  orgId,
  defaultValues,
}: OrganizationSettingsFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { name: "", domain: "" },
  });

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

  return (
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
  );
}

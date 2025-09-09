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
import { WhoamiResponse } from "api/js/svc/user/v1/service_private_pb";
import { useMutation } from "@connectrpc/connect-query";
import { updateUser } from "api/js/svc/user/v1/service_private-UserService_connectquery";

interface UserSettingsFormProps {
  userInfo: WhoamiResponse;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().optional(),
  username: z.string().optional(),
});

export function UserSettingsForm({ userInfo }: UserSettingsFormProps) {
  const { apiClients } = useApiClients();
  const { getUserInfo } = useAllEnvironments();
  const router = useRouter();
  const [formChanged, setFormChanged] = useState(false);

  const { mutate: updateUserMutation, isPending } = useMutation(updateUser, {
    onSuccess: (res) => {
      getUserInfo();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Initialize form with user data or empty values if user is not loaded yet
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: userInfo?.user ? userInfo.user.firstName || "" : "",
      lastName: userInfo?.user ? userInfo.user.lastName || "" : "",
      username: userInfo?.user ? userInfo.user.username || "" : "",
    },
  });

  // Watch form values to detect changes
  const watchedValues = form.watch();

  // Check if form values have changed from initial values
  useEffect(() => {
    if (!userInfo?.user) return;

    const initialValues = {
      firstName: userInfo.user.firstName || "",
      lastName: userInfo.user.lastName || "",
      username: userInfo.user.username || "",
    };

    const hasChanged =
      watchedValues.firstName !== initialValues.firstName ||
      watchedValues.lastName !== initialValues.lastName ||
      watchedValues.username !== initialValues.username;

    setFormChanged(hasChanged);
  }, [watchedValues, userInfo]);

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
    if (userInfo?.user) {
      form.reset({
        firstName: userInfo.user.firstName || "",
        lastName: userInfo.user.lastName || "",
        username: userInfo.user.username || "",
      });
    }
  };

  // Update form values when user data changes
  useEffect(() => {
    handleReset();
  }, [userInfo, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!apiClients) return;
    const { firstName, lastName, username } = values;

    updateUserMutation({
      firstName,
      lastName,
      username,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
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

        {/* User  Name Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="User Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant={formChanged ? "default" : "outline"}>
            {isPending ? (
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
              disabled={isPending}
            >
              Discard changes
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

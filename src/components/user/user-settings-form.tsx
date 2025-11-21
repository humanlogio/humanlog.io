"use client";

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
import { Loader, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "@connectrpc/connect-query";
import { updateUser } from "api/js/svc/user/v1/service_private-UserService_connectquery";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";
import { User } from "better-auth";

interface UserSettingsFormProps {
  user: User;
  refetchSession: () => void;
}

const formSchema = z.object({
  // firstName: z.string().min(1, "First Name is required"),
  // lastName: z.string().optional(),
  username: z.string().optional(),
});

export function UserSettingsForm({
  user,
  refetchSession,
}: UserSettingsFormProps) {
  const [formChanged, setFormChanged] = useState(false);

  const { mutate: updateUserMutation, isPending: isUpdatingUserPending } =
    useMutation(updateUser, {
      onSuccess: (res) => {
        refetchSession();
        toast.success("Settings updated", {
          description:
            "Your profile information has been updated successfully.",
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Initialize form with user data or empty values if user is not loaded yet
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // firstName: userData?.user ? userData.user.firstName || "" : "",
      // lastName: userData?.user ? userData.user.lastName || "" : "",
      username: user.name,
    },
  });

  // Watch form values to detect changes
  const watchedValues = form.watch();

  const { status: usernameStatus, setStatus: setUsernameStatus } =
    useUsernameValidation({
      username: watchedValues.username || "",
      skipIfUnchanged: user?.name || "",
    });

  // Check if form values have changed from initial values
  useEffect(() => {
    if (!user) return;

    const initialValues = {
      // firstName: userData.user.firstName || "",
      // lastName: userData.user.lastName || "",
      username: user.name || "",
    };

    const hasChanged =
      // watchedValues.firstName !== initialValues.firstName ||
      // watchedValues.lastName !== initialValues.lastName ||
      watchedValues.username !== initialValues.username;

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
    if (user) {
      form.reset({
        // firstName: userData.user.firstName || "",
        // lastName: userData.user.lastName || "",
        username: user.name || "",
      });
      setUsernameStatus("idle");
    }
  };

  // Update form values when user data changes
  useEffect(() => {
    handleReset();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if username is taken before submitting
    if (values.username && usernameStatus === "taken") {
      toast.error("Username is already taken");
      return;
    }

    const { username } = values;

    updateUserMutation({
      // firstName,
      // lastName,
      username,
    });
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <Loader className="h-4 w-4 animate-spin text-gray-500" />;
      case "available":
        return <Check className="h-4 w-4 text-green-500" />;
      case "taken":
      case "tooShort":
      case "invalidFormat":
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case "checking":
        return (
          <span className="text-sm text-gray-500">
            Checking availability...
          </span>
        );
      case "available":
        return (
          <span className="text-sm text-green-600">Username is available</span>
        );
      case "taken":
        return (
          <span className="text-sm text-red-600">
            Username is already taken
          </span>
        );
      case "tooShort":
        return (
          <span className="text-sm text-red-600">
            Username must be at least 3 characters
          </span>
        );
      case "invalidFormat":
        return (
          <span className="text-sm text-red-600">
            Username can only contain letters, numbers, and hyphens
          </span>
        );
      case "error":
        return (
          <span className="text-sm text-red-600">
            Unable to check availability. Please try again.
          </span>
        );
      default:
        return null;
    }
  };

  const isSubmitDisabled = () => {
    return !!(
      isUpdatingUserPending ||
      usernameStatus === "taken" ||
      usernameStatus === "checking" ||
      usernameStatus === "tooShort" ||
      usernameStatus === "invalidFormat" ||
      usernameStatus === "error"
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
      >
        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-3">
          {/* Name Field */}
          {/* <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="First Name"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.trim())}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* Last Name Field */}
          {/* <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Last Name (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Last Name"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.trim())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>

        {/* User  Name Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="User Name"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.trim())}
                    required
                  />
                </div>
              </FormControl>
              <div className="flex min-h-[20px] items-center gap-2">
                {getUsernameStatusIcon()}
                {getUsernameStatusText()}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant={formChanged ? "default" : "outline"}
            disabled={isSubmitDisabled()}
          >
            {isUpdatingUserPending ? (
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
              disabled={isUpdatingUserPending}
            >
              Discard changes
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

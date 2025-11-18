"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, CloseIcon } from "public/icons";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const checkEmailFormSchema = z.object({
  email: z.string().email("Please enter a valid email."),
});

type CheckEmailFormData = z.infer<typeof checkEmailFormSchema>;

export default function RequestResetPage() {
  const router = useRouter();

  const { requestPasswordReset } = authClient;

  const emailVerificationForm = useForm<CheckEmailFormData>({
    resolver: zodResolver(checkEmailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { formState } = emailVerificationForm;
  const { errors, isSubmitting } = formState;

  const { isEmailValid } = useEmailValidation({
    watch: emailVerificationForm.watch,
  });

  const onSubmit = async (formData: CheckEmailFormData) => {
    const { email } = formData;
    await requestPasswordReset(
      {
        email,
        redirectTo: "/sign-in/reset-password/confirm",
      },
      {
        onSuccess: (ctx) => {
          toast.success(
            "Password reset email sent successfully",
            ctx.data.message,
          );
          router.push(`/sign-in/reset-password/check-email?email=${email}`);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <>
      <div className="mb-12 flex flex-col items-center">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-muted-foreground w-96 text-sm">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <Form {...emailVerificationForm}>
        <form
          onSubmit={emailVerificationForm.handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <FormField
            control={emailVerificationForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Email address"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  {errors.email && field.value.length > 0 ? (
                    <button
                      type="button"
                      className="absolute top-1/2 right-4 -translate-y-1/2"
                      onClick={() => {
                        emailVerificationForm.resetField("email");
                      }}
                    >
                      <CloseIcon />
                    </button>
                  ) : (
                    isEmailValid && (
                      <CheckIcon className="absolute top-1/2 right-4 -translate-y-1/2" />
                    )
                  )}
                </div>
                <div className="h-7">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
          </Button>
        </form>
      </Form>
    </>
  );
}

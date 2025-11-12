"use client";

import { EmailSentConfirmation } from "@/components/auth/email-sent-confirmation";
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
import { Loader2 } from "lucide-react";
import { CheckIcon, CloseIcon } from "public/icons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const emailVerificationFormSchema = z.object({
  email: z.string().email("Please enter a valid email."),
});

type EmailVerificationFormData = z.infer<typeof emailVerificationFormSchema>;

export default function EmailVerificationForm() {
  const { requestPasswordReset } = authClient;
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const emailVerificationForm = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { formState } = emailVerificationForm;
  const { errors, isSubmitting } = formState;

  const { isEmailValid } = useEmailValidation({
    watch: emailVerificationForm.watch,
  });

  const onSubmit = async (formData: EmailVerificationFormData) => {
    const { email } = formData;
    await requestPasswordReset(
      {
        email,
        redirectTo: "/sign-in/reset-password",
      },
      {
        onSuccess: (ctx) => {
          setEmailSent(true);
          setSentEmail(email);
          toast.success(
            "Password reset email sent successfully",
            ctx.data.message,
          );
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };
  if (emailSent) {
    return (
      <EmailSentConfirmation
        title="Check your email"
        description="Please check your email to reset your password."
        email={sentEmail}
        onAction={() => {
          setEmailSent(false);
          emailVerificationForm.reset();
        }}
      />
    );
  }

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

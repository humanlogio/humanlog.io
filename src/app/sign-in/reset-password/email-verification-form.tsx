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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { CheckIcon, CloseIcon } from "public/icons";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const emailVerificationFormSchema = z.object({
  email: z.string().email("Please enter a valid email."),
});

type EmailVerificationFormData = z.infer<typeof emailVerificationFormSchema>;

interface EmailVerificationFormProps {
  setIsEmailVerified: Dispatch<SetStateAction<boolean>>;
}

export default function EmailVerificationForm({
  setIsEmailVerified,
}: EmailVerificationFormProps) {
  const emailVerificationForm = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { formState, setError, watch } = emailVerificationForm;
  const { errors, isSubmitting } = formState;

  const { isEmailValid } = useEmailValidation({
    watch: emailVerificationForm.watch,
  });

  const onSubmit = async (formData: EmailVerificationFormData) => {
    // TODO: call api to verify email
    setIsEmailVerified(true);
    toast.success("Email verified successfully");
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

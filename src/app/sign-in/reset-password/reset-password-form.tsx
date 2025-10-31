"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const ResetPasswordFormSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine(
      (password) => {
        const result = zxcvbn(password);
        return result.score >= 2;
      },
      {
        message: "Password is too weak. Please choose a stronger password.",
      },
    ),
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = authClient;

  const [showPassword, setShowPassword] = useState(false);

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const { formState, setError, watch } = resetPasswordForm;
  const { errors, isSubmitting } = formState;
  const passwordValue = watch("newPassword");
  const passwordStrength = usePasswordStrength(passwordValue);

  const onSubmit = async (formData: ResetPasswordFormData) => {
    const { newPassword } = formData;
    const { data, error } = await resetPassword(
      {
        newPassword,
      },
      {
        onRequest: (ctx) => {},
        onSuccess: (ctx) => {
          toast.success("Password reset successfully");
          router.push("/sign-in/reset-password/success");
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
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="text-muted-foreground text-sm">
          Please enter a strong new password for your account.
        </p>
      </div>

      <Form {...resetPasswordForm}>
        <form
          onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <FormField
            control={resetPasswordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <Eye size={16} className="text-muted-foreground" />
                    ) : (
                      <EyeOff size={16} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="h-26">
                  <PasswordStrengthIndicator
                    strength={passwordStrength}
                    password={passwordValue}
                    showFeedback={true}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </>
    // <div className="w-[320px]">
    //   <div className="flex w-full flex-col items-center">
    //     <div className="mb-12 flex flex-col items-center">
    //       <h1 className="text-xl font-semibold">Set a new password</h1>
    //       <p className="text-muted-foreground text-sm">
    //         Please enter a strong new password for your account.
    //       </p>
    //     </div>

    //     <Form {...resetPasswordForm}>
    //       <form
    //         onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
    //         className="flex w-full flex-col"
    //       >
    //         <FormField
    //           control={resetPasswordForm.control}
    //           name="password"
    //           render={({ field }) => (
    //             <FormItem>
    //               <div className="relative">
    //                 <FormControl>
    //                   <Input
    //                     type={showPassword ? "text" : "password"}
    //                     placeholder="Enter your password"
    //                     className="h-10"
    //                     {...field}
    //                   />
    //                 </FormControl>
    //                 <button
    //                   type="button"
    //                   className="absolute top-1/2 right-4 -translate-y-1/2"
    //                   onClick={() => setShowPassword((prev) => !prev)}
    //                 >
    //                   {showPassword ? (
    //                     <Eye size={16} className="text-muted-foreground" />
    //                   ) : (
    //                     <EyeOff size={16} className="text-muted-foreground" />
    //                   )}
    //                 </button>
    //               </div>
    //               <div className="h-26">
    //                 <PasswordStrengthIndicator
    //                   strength={passwordStrength}
    //                   password={passwordValue}
    //                   showFeedback={true}
    //                 />
    //                 <FormMessage />
    //               </div>
    //             </FormItem>
    //           )}
    //         />
    //         <Button type="submit" className="w-full" disabled={isSubmitting}>
    //           {isSubmitting ? (
    //             <Loader2 className="animate-spin" />
    //           ) : (
    //             "Reset Password"
    //           )}
    //         </Button>
    //       </form>
    //     </Form>
    //     <div className="mt-6 flex items-center justify-center">
    //       <span className="text-sm text-neutral-500">
    //         Remembered your password?
    //       </span>
    //       <Button
    //         variant="link"
    //         className="text-sm font-normal text-blue-500"
    //         onClick={() => router.push("/sign-in")}
    //       >
    //         Sign in
    //       </Button>
    //     </div>
    //   </div>
    // </div>
  );
}

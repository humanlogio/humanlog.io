"use client";

import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, CloseIcon } from "public/icons";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import zxcvbn from "zxcvbn";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import {
  UsernameStatusIcon,
  UsernameStatusText,
} from "@/components/auth/username-status";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";

export default function SignUpPage() {
  const router = useRouter();

  const { signUp, organization } = authClient;

  const [signUpMode, setSignUpMode] = useState<"social" | "email">("social");
  const [showPassword, setShowPassword] = useState(false);

  const BaseSignUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
  });

  const SocialSignUpSchema = BaseSignUpSchema;
  const EmailSignUpSchema = BaseSignUpSchema.extend({
    email: z.string().email("Please enter a valid email."),
    password: z
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

  type SocialSignUpFormData = z.infer<typeof SocialSignUpSchema>;
  type EmailSignUpFormData = z.infer<typeof EmailSignUpSchema>;

  const socialForm = useForm<SocialSignUpFormData>({
    resolver: zodResolver(BaseSignUpSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });

  const emailForm = useForm<EmailSignUpFormData>({
    resolver: zodResolver(EmailSignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const currentForm = signUpMode === "email" ? emailForm : socialForm;
  const { formState, watch, setError, clearErrors, getValues } = currentForm;
  const { isSubmitting } = formState;

  const socialSignUpConfig = {
    callbackURL: "/",
    errorCallbackURL: "/sign-up/fail",
    newUserCallbackURL: `/sign-up/social?username=${socialForm.getValues("username")}`,
  };

  const passwordValue =
    signUpMode === "email" ? emailForm.watch("password") : "";

  const { isEmailValid } = useEmailValidation({
    watch: emailForm.watch,
  });
  const passwordStrength = usePasswordStrength(passwordValue);

  const switchToEmailMode = () => {
    if (signUpMode === "social") {
      setSignUpMode("email");

      const currentUsername = socialForm.getValues("username");
      emailForm.setValue("username", currentUsername);
      emailForm.trigger("username");
    }
  };

  const onEmailSubmit = async (formData: EmailSignUpFormData) => {
    const { username, email, password } = formData;

    await signUp.email(
      {
        email,
        password,
        name: username,
        username,
        callbackURL: "/sign-up/success",
      },
      {
        onRequest: (ctx) => {
          console.log("ctx in signUp onRequest", ctx);
        },
        onSuccess: (ctx) => {
          // test create organization
          organization.create(
            {
              name: username,
              slug: username,
            },
            {
              onSuccess: (ctx) => {
                alert("organization created");
                console.log("ctx in signUp onSuccess create organization", ctx);
              },
              onError: (ctx) => {
                alert("organization creation failed");
                console.log("ctx in signUp onError create organization", ctx);
              },
            },
          );
          router.push(`/sign-up/email-verify?email=${email}`);
        },
        onError: (ctx) => {
          // when email verification is required
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address");
          }
          // display the error message
          console.log("ctx in signUp onError", ctx);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const socialUsername = socialForm.watch("username");
  const emailUsername = emailForm.watch("username");
  const currentUsername =
    signUpMode === "email" ? emailUsername : socialUsername;

  const { status: usernameStatus } = useUsernameValidation({
    username: currentUsername,
  });

  return (
    <div className="w-[472px]">
      <h1 className="mb-5 text-center text-xl font-semibold">
        Create your account
      </h1>
      <div className="w-full rounded-lg bg-neutral-100 px-16 pt-6 dark:bg-neutral-900">
        <Form {...socialForm}>
          <FormField
            control={socialForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="relative m-0">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Evil Rabbit"
                      className="h-10"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);

                        if (signUpMode === "email") {
                          emailForm.setValue("username", e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <UsernameStatusIcon status={usernameStatus} />
                  </div>
                </div>

                <div className="h-7">
                  <UsernameStatusText status={usernameStatus} />
                </div>
              </FormItem>
            )}
          />
        </Form>
      </div>

      <div className="mt-5 flex w-full flex-col items-center rounded-lg bg-neutral-100 px-8 pt-6 pb-7.5 dark:bg-neutral-900">
        <div className="flex w-full gap-5">
          <SocialAuthButtons className="flex-row" config={socialSignUpConfig} />
        </div>

        <div className="my-5 flex w-full items-center justify-center">
          <Separator className="flex-1" />
          <span className="text-muted-foreground mx-3 text-sm">
            Or continue with email
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex w-[320px] flex-col">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <div className="relative m-0">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-10"
                          onFocus={switchToEmailMode}
                          {...field}
                        />
                      </FormControl>
                      {signUpMode === "email" &&
                      emailForm.formState.errors.email &&
                      field.value.length > 0 ? (
                        <button
                          type="button"
                          className="absolute top-1/2 right-4 -translate-y-1/2"
                          onClick={() => {
                            emailForm.resetField("email");
                          }}
                        >
                          <CloseIcon />
                        </button>
                      ) : (
                        signUpMode === "email" &&
                        isEmailValid && (
                          <CheckIcon className="absolute top-1/2 right-4 -translate-y-1/2" />
                        )
                      )}
                    </div>
                    <div className="h-7">
                      {signUpMode === "email" && <FormMessage />}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative m-0">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-10"
                          onFocus={switchToEmailMode}
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
                    <div className="h-8">
                      {signUpMode === "email" && (
                        <>
                          <PasswordStrengthIndicator
                            strength={passwordStrength}
                            password={passwordValue}
                          />
                          <FormMessage />
                        </>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-5 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center">
        <span className="text-sm text-neutral-500">
          Already have an account?
        </span>
        <Button
          variant="link"
          className="text-sm font-normal text-blue-500"
          onClick={() => router.push("/sign-in")}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}

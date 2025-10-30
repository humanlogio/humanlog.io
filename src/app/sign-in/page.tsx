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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, GithubIcon, GoogleIcon, CloseIcon } from "public/icons";

const SignInFormSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string(),
});

type SignInFormData = z.infer<typeof SignInFormSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { errors } = signInForm.formState;

  const onSubmit = (data: SignInFormData) => {
    console.log(data);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-[320px]">
        <div className="flex w-full flex-col items-center">
          <h1 className="text-xl font-semibold">Sign in to Humanlog</h1>
          <div className="mt-12 flex w-full flex-col gap-5">
            <Button variant="outline" className="h-10">
              <GoogleIcon />
              Continue with Gmail
            </Button>
            <Button variant="outline">
              <GithubIcon />
              Continue with Github
            </Button>
          </div>
          <div className="my-8 flex w-full items-center justify-center">
            <Separator className="flex-1" />
            <span className="text-muted-foreground mx-3 text-sm">or</span>
            <Separator className="flex-1" />
          </div>

          <Form {...signInForm}>
            <form
              onSubmit={signInForm.handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-8"
            >
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or username</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email or username"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      {errors.email ? (
                        <button
                          type="button"
                          className="absolute top-1/2 right-4 -translate-y-1/2"
                          onClick={() => {
                            signInForm.resetField("email");
                          }}
                        >
                          <CloseIcon />
                        </button>
                      ) : (
                        signInForm.getValues("email") && (
                          <CheckIcon className="absolute top-1/2 right-4 -translate-y-1/2" />
                        )
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Button
                        variant="link"
                        type="button"
                        className="p-0 text-sm font-normal text-blue-500"
                        onClick={() => router.push("/forgot-password")}
                      >
                        Forget your password?
                      </Button>
                    </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-15 flex items-center justify-center">
            <span className="text-sm text-neutral-500">
              Don&apos;t have an account?
            </span>
            <Button
              variant="link"
              className="text-sm font-normal text-blue-500"
              onClick={() => router.push("/sign-up")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

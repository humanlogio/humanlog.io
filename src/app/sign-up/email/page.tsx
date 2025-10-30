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
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, CloseIcon } from "public/icons";

const SignUpWithEmailFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email."),
  password: z.string(),
});

type SignUpWithEmailFormData = z.infer<typeof SignUpWithEmailFormSchema>;

export default function SignUpWithEmailPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const SignUpWithEmailForm = useForm<SignUpWithEmailFormData>({
    resolver: zodResolver(SignUpWithEmailFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const { errors } = SignUpWithEmailForm.formState;

  const onSubmit = (data: SignUpWithEmailFormData) => {
    // TODO: api fetch
    console.log("data", data);
    router.push(`/sign-up/email/verify?email=${data.email}`);
  };

  return (
    <div className="w-[320px]">
      <div className="flex w-full flex-col items-center">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-muted-foreground text-sm">
          Start your journey by filling out the form below.
        </p>

        <Form {...SignUpWithEmailForm}>
          <form
            onSubmit={SignUpWithEmailForm.handleSubmit(onSubmit)}
            className="mt-8 flex w-full flex-col gap-7"
          >
            <FormField
              control={SignUpWithEmailForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="username"
                      placeholder="Evil Rabbit"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={SignUpWithEmailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    {errors.email ? (
                      <button
                        type="button"
                        className="absolute top-1/2 right-4 -translate-y-1/2"
                        onClick={() => {
                          SignUpWithEmailForm.resetField("email");
                        }}
                      >
                        <CloseIcon />
                      </button>
                    ) : (
                      SignUpWithEmailForm.getValues("email") && (
                        <CheckIcon className="absolute top-1/2 right-4 -translate-y-1/2" />
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={SignUpWithEmailForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

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
            <Button type="submit" className="mt-13 w-full">
              Continue
            </Button>
          </form>
        </Form>
        <div className="mt-15 flex items-center justify-center">
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
    </div>
  );
}

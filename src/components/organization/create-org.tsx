"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "node_modules/react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  name: z.string().min(1, "Organization name is required."),
});
type FormData = z.infer<typeof FormSchema>;

interface CreateOrgProps {
  title: string;
  onSuccess: () => void;
}

export const CreateOrg = ({ title, onSuccess }: CreateOrgProps) => {
  const router = useRouter();
  const { organization, useSession } = authClient;
  const { data: session } = useSession();

  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCreatingOrg(true);
    const { name } = data;
    await organization.create(
      {
        name,
        slug: name,
        userId: session?.user.id,
        keepCurrentActiveOrganization: false,
        metadata: {
          createdBy: session?.user.id,
        },
      },
      {
        onSuccess: () => {
          onSuccess();
          setIsCreatingOrg(false);
        },
        onError: (error) => {
          toast.error(`Failed to create organization: ${error.error.message}`);
          setIsCreatingOrg(false);
        },
      },
    );
  };

  return (
    <div className="flex max-w-[579px] flex-col items-center justify-center">
      <div className="flex flex-col items-center rounded-lg bg-neutral-100 px-8 py-7 dark:bg-neutral-900">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-3 text-sm font-normal">
          Set up the workspace where your team will manage services and
          environments.
        </p>
        <div className="mt-5 w-[320px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl className="mt-2">
                      <Input
                        {...field}
                        placeholder="Enter your organization name"
                      />
                    </FormControl>
                    <div className="h-7">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreatingOrg}>
                {isCreatingOrg ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create organization"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="my-10 flex w-full items-center justify-center">
        <Separator className="flex-1" />
        <span className="text-muted-foreground mx-3 text-sm">Or</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex w-full flex-col items-center rounded-lg bg-neutral-100 px-8 py-7 dark:bg-neutral-900">
        <p className="text-base font-medium">Join existing organization</p>
        <p className="text-muted-foreground mt-2 text-center text-sm font-normal">
          Please contact an administrator of the existing <br />
          organization and request an invitation.
        </p>
      </div>
    </div>
  );
};

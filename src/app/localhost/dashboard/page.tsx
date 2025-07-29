"use client";

import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  createDashboard,
  listDashboard,
} from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import {
  createStack,
  listStack,
} from "api/js/svc/stack/v1/service-StackService_connectquery";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User } from "lucide-react";
import { CreateDashboardRequest } from "api/js/svc/dashboard/v1/service_pb";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { logger } from "@/lib/utils/telemetry/logger";
import { toast } from "sonner";
import {
  createMockDashboards,
  createDefaultDashboardTemplate,
} from "@/lib/mocks/sampleDashboards";
import { Badge } from "@/components/ui/badge";
import { useApiClients } from "@/context/api-provider";
import { CreateStackRequest } from "api/js/svc/stack/v1/service_pb";
import { StackPointer } from "api/js/types/v1/stack_pb";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Dashboard name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isReadonly: z.boolean().default(false),
});

const stackFormSchema = z.object({
  name: z.string().min(1, "Stack name is required"),
  path: z.string().min(1, "Pointer path is required"),
  dashboardDir: z.string().min(1, "Dashboard directory is required"),
  alertDir: z.string().min(1, "Alert directory is required"),
});

type FormData = z.infer<typeof formSchema>;
type StackFormData = z.infer<typeof stackFormSchema>;

export default function DashboardListPage() {
  const router = useRouter();
  const { activeEnvironment } = useApiClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStackDialogOpen, setIsStackDialogOpen] = useState(false);

  const { isLoading: isLoadingListStack, data: stackList } = useQuery(
    listStack,
    { environmentId: activeEnvironment?.id },
  );
  const {
    isLoading,
    data: dashboardList,
    refetch,
  } = useQuery(listDashboard, {
    environmentId: activeEnvironment?.id,
  });

  const { mutate: createStackMutation, isPending: isCreatingStack } =
    useMutation(createStack);

  const { mutate: createDashboardMutation, isPending: isCreatingDashboard } =
    useMutation(createDashboard);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isReadonly: false,
    },
  });

  const onSubmit = (data: FormData) => {
    // Create default dashboard template
    const defaultTemplate = createDefaultDashboardTemplate(
      data.name,
      data.description,
    );

    const persesJsonBytes = new TextEncoder().encode(
      JSON.stringify(defaultTemplate),
    ) as Uint8Array<ArrayBuffer>;

    const newDashboard = new CreateDashboardRequest({
      name: data.name,
      description: data.description || "",
      isReadonly: data.isReadonly,
      persesJson: persesJsonBytes, // Add the default template
    });

    createDashboardMutation(newDashboard, {
      onSuccess: (response) => {
        console.log("Dashboard created successfully:", response);
        logger.info(`Dashboard created successfully: ${response}`);
        toast.info("Dashboard created successfully");
        refetch(); // Refresh the dashboard list
        setIsDialogOpen(false);
        form.reset();
        if (response.dashboard?.id) {
          router.push(`/localhost/dashboard/${response.dashboard.id}`);
        }
      },
      onError: (error) => {
        toast.error(`Failed to create dashboard: ${error.message}`);
        logger.error(`Failed to create dashboard: ${error.message}`);
      },
    });
  };

  const onStackSubmit = (data: StackFormData) => {
    const { name, path, dashboardDir, alertDir } = data;
    const newStack = new CreateStackRequest({
      environmentId: activeEnvironment?.id,
      name,
      pointer: new StackPointer({
        scheme: {
          case: "localhost",
          value: {
            path,
            dashboardDir,
            alertDir,
          },
        },
      }),
    });

    createStackMutation(newStack, {
      onSuccess: (response) => {
        console.log("Stack created successfully:", response);
        logger.info("Stack created successfully");
        toast.info("Stack created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create dashboard: ${error.message}`);
        logger.error(`Failed to create dashboard: ${error.message}`);
      },
    });
  };

  const handleDashboardClick = (dashboardId: string) => {
    router.push(`/localhost/dashboard/${dashboardId}`);
  };

  const displayData = dashboardList?.items;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
        </div>
        {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
              <DialogDescription>
                Create a new dashboard to organize your data visualizations.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dashboard Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter dashboard name"
                          {...field}
                          disabled={isCreatingDashboard}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your dashboard a descriptive name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <AutosizeTextarea
                          placeholder="Enter dashboard description"
                          className="min-h-[80px]"
                          {...field}
                          disabled={isCreatingDashboard}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide additional context about this dashboard.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Dashboard"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog> */}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Stack
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Stack</DialogTitle>
              <DialogDescription>
                Create a new stack to organize your data visualizations.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stack Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter stack name"
                          {...field}
                          disabled={isCreatingStack}
                        />
                      </FormControl>
                      <FormDescription>
                        Give your stack a descriptive name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreatingStack}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingStack}>
                    {isCreatingStack ? "Creating..." : "Create Stack"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {displayData && displayData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayData.map((item) => {
            const dashboard = item.dashboard;
            if (!dashboard) return null;

            return (
              <div
                key={dashboard.id?.toString()}
                onClick={() => handleDashboardClick(dashboard.id)}
                className="cursor-pointer rounded-lg border border-gray-200 shadow-md transition-shadow duration-200 hover:border-blue-300 hover:shadow-lg dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="truncate text-xl font-semibold text-gray-900 dark:text-white">
                      {dashboard.name || "Untitled Dashboard"}
                    </h3>
                    <div className="text-muted-foreground flex flex-col items-end text-sm">
                      {dashboard.isReadonly && (
                        <Badge variant="secondary" className="mt-1">
                          Read Only
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* for debugging */}
                  {/* <div className="mb-4 text-sm">
                    ID: {dashboard.id?.toString()}
                  </div> */}

                  {dashboard.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {dashboard.description}
                    </p>
                  )}

                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {dashboard.createdAt
                          ? new Date(
                              Number(dashboard.createdAt.seconds) * 1000,
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto rounded-lg p-8">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No dashboards found
            </h3>
            <p className="mb-6 text-gray-600">
              Get started by creating your first dashboard
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

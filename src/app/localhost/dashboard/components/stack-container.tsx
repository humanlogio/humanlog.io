"use client";

import { useMutation, useQuery } from "@connectrpc/connect-query";
import { createDashboard } from "api/js/svc/dashboard/v1/service-DashboardService_connectquery";
import { getStack } from "api/js/svc/stack/v1/service-StackService_connectquery";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
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
import { createDefaultDashboardTemplate } from "@/lib/mocks/sampleDashboards";
import { Badge } from "@/components/ui/badge";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useApiClients } from "@/context/api-provider";
import { Stack } from "api/js/types/v1/stack_pb";
import { PointerInfo } from "@/app/localhost/dashboard/components/pointer-info";
import { ReadOnlyField } from "@/app/localhost/dashboard/components/read-only-field";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Dashboard name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isReadonly: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface StackContainerProps {
  stack: Stack;
  expandedStacks: Set<string>;
  setExpandedStacks: (expandedStacks: Set<string>) => void;
}

export const StackContainer = ({
  stack,
  expandedStacks,
  setExpandedStacks,
}: StackContainerProps) => {
  const router = useRouter();
  const { activeEnvironment } = useApiClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stackContents, setStackContents] = useState<Record<string, any>>({});

  const isStackReadonly = (stack: Stack): boolean => {
    const { pointer } = stack;
    if (!pointer?.scheme) return false;

    const { case: pointerType, value } = pointer.scheme;

    if (pointerType === "localhost") {
      const localPointer = value as any;
      return localPointer.readOnly === true;
    }

    if (pointerType === "remote") {
      return true;
    }

    return false;
  };

  const isExpanded = expandedStacks.has(stack.name);

  const { data: stackData, isLoading: isLoadingStack } = useQuery(
    getStack,
    {
      environmentId: activeEnvironment?.id,
      name: stack.name,
    },
    {
      enabled: isExpanded,
    },
  );

  const { mutate: createDashboardMutation, isPending: isCreatingDashboard } =
    useMutation(createDashboard);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isReadonly: true,
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
      stackName: stack.name,
      description: data.description || "",
      isReadonly: data.isReadonly,
      persesJson: persesJsonBytes, // Add the default template
    });

    createDashboardMutation(newDashboard, {
      onSuccess: (response) => {
        logger.info(`Dashboard created successfully: ${response}`);
        toast.info("Dashboard created successfully");

        setIsDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(`Failed to create dashboard: ${error.message}`);
        logger.error(`Failed to create dashboard: ${error.message}`);
      },
    });
  };

  const handleDashboardClick = (dashboardId: string) => {
    router.push(`/localhost/dashboard/${dashboardId}?stackName=${stack.name}`);
  };

  const handleStackExpand = (stackName: string) => {
    if (expandedStacks.has(stackName)) {
      // Collapsing - remove from expanded set
      const newExpanded = new Set(expandedStacks);
      newExpanded.delete(stackName);
      setExpandedStacks(newExpanded);
    } else {
      // Expanding - add to expanded set and fetch data if not already loaded
      const newExpanded = new Set(expandedStacks);
      newExpanded.add(stackName);
      setExpandedStacks(newExpanded);

      if (!stackContents[stackName]) {
        setStackContents((prev) => ({
          ...prev,
          [stackName]: stackData,
        }));
      }
    }
  };
  return (
    <AccordionItem key={stack.name} value={stack.name}>
      <AccordionTrigger
        className="hover:no-underline"
        onClick={() => handleStackExpand(stack.name)}
      >
        <div className="mr-2 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{stack.name}</h3>
            {(() => {
              const { pointer } = stack;
              if (!pointer) return;
              const { case: pointerType } = pointer.scheme;
              const getPointerBadgeClassName = (type: string | undefined) => {
                switch (type) {
                  case "localhost":
                    return "text-xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
                  case "remote":
                    return "text-xs border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/60 dark:text-purple-300";
                  case "db":
                    return "text-xs border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-300";
                  default:
                    return "text-xs";
                }
              };
              return (
                <Badge
                  variant="outline"
                  className={getPointerBadgeClassName(pointerType)}
                >
                  {pointerType || "unknown"}
                </Badge>
              );
            })()}

            {isStackReadonly(stack) && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Read Only
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {isLoadingStack ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-black dark:border-white" />
          </div>
        ) : (
          <div className="space-y-6">
            <PointerInfo stack={stack} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-md font-medium">Dashboards</h4>
                {!isStackReadonly(stack) && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Dashboard
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Dashboard</DialogTitle>
                        <DialogDescription>
                          Create a new dashboard to organize your data
                          visualizations.
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

                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <ReadOnlyField
                            control={form.control}
                            readOnly={form.watch("isReadonly")}
                            disabled={isCreatingDashboard}
                            fieldName="isReadonly"
                          />

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                              disabled={isCreatingDashboard}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isCreatingDashboard}
                            >
                              {isCreatingDashboard
                                ? "Creating..."
                                : "Create Dashboard"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {stackData?.dashboards && stackData?.dashboards.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stackData?.dashboards.map((dashboard: any) => (
                    <div
                      key={dashboard.id?.toString()}
                      onClick={() => handleDashboardClick(dashboard.id)}
                      className="border-muted cursor-pointer rounded-lg border p-4 transition-shadow duration-200 hover:border-gray-500"
                    >
                      <div className="flex items-start justify-between">
                        <h5 className="truncate font-medium text-gray-900 dark:text-white">
                          {dashboard.name || "Untitled Dashboard"}
                        </h5>
                        {dashboard.isReadonly && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Read Only
                          </Badge>
                        )}
                      </div>
                      {dashboard.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {dashboard.description}
                        </p>
                      )}
                      <div className="text-muted-foreground mt-3 flex items-center text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>
                          {dashboard.createdAt
                            ? new Date(
                                Number(dashboard.createdAt.seconds) * 1000,
                              ).toLocaleDateString()
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                  <p className="text-muted-foreground text-sm">
                    No dashboards in this stack
                  </p>
                </div>
              )}
            </div>

            {/* TODO: Alerts Section */}
            {/* <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-md font-medium">Alert Groups</h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Alert
                </Button>
              </div>
              {stackData.alertGroups && stackData.alertGroups.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {stackData.alertGroups.map(
                    (alertGroup: any, index: number) => (
                      <div
                        key={alertGroup.id?.toString() || index}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                      >
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {alertGroup.name || "Untitled Alert Group"}
                        </h5>
                        {alertGroup.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {alertGroup.description}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
                  <p className="text-muted-foreground text-sm">
                    No alert groups in this stack
                  </p>
                </div>
              )}
            </div> */}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

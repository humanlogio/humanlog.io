"use client";

import { useQuery } from "@connectrpc/connect-query";
import { listStack } from "api/js/svc/stack/v1/service-StackService_connectquery";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accordion } from "@/components/ui/accordion";
import { useApiClients } from "@/context/api-provider";
import { StackContainer } from "@/app/localhost/dashboard/components/stack-container";
import LoadingIndicator from "@/components/loading-indicator";
import { StackForm } from "@/app/localhost/dashboard/components/stack-form";

export default function DashboardListPage() {
  const { activeEnvironment } = useApiClients();

  const [isStackDialogOpen, setIsStackDialogOpen] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());

  const {
    data: stackList,
    refetch: refetchStackList,
    isLoading: isLoadingStackList,
  } = useQuery(listStack, {
    environmentId: activeEnvironment?.id,
  });

  if (isLoadingStackList) {
    return <LoadingIndicator message="Loading stacks..." />;
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stacks
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your dashboards
            {/* TODO */} {/* and alerts */}
            organized by stacks
          </p>
        </div>

        <Dialog open={isStackDialogOpen} onOpenChange={setIsStackDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
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
              <StackForm
                setIsStackDialogOpen={setIsStackDialogOpen}
                refetchStackList={refetchStackList}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {stackList?.items && stackList.items.length > 0 ? (
        <div className="space-y-4">
          <Accordion
            type="multiple"
            value={Array.from(expandedStacks)}
            onValueChange={(value) => {
              setExpandedStacks(new Set(value));
            }}
          >
            {stackList.items.map((item) => {
              const stack = item.stack;
              if (!stack?.name) return null;

              return (
                <StackContainer
                  key={stack?.name}
                  stack={stack}
                  expandedStacks={expandedStacks}
                  setExpandedStacks={setExpandedStacks}
                />
              );
            })}
          </Accordion>
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto rounded-lg p-8">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No stacks found
            </h3>
            <p className="mb-6 text-gray-600">
              Get started by creating your first stack to organize your
              dashboards and alerts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

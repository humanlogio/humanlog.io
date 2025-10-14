"use client";

import { useQuery } from "@connectrpc/connect-query";
import { listProject } from "api/js/svc/project/v1/service-ProjectService_connectquery";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accordion } from "@/components/ui/accordion";
import LoadingIndicator from "@/components/loading-indicator";
import { ProjectContainer } from "@/app/[org]/[env]/dashboard/components/project-container";
import { ProjectForm } from "@/app/[org]/[env]/dashboard/components/project-form";
import { useEnvironmentStore } from "@/stores/environment-store";
import { usePage } from "@/stores/page-store";

export default function DashboardListPage() {
  const { activeEnvironment } = useEnvironmentStore();
  const { activePage, setActivePage } = usePage();

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  const {
    data: projectList,
    refetch: refetchProjectList,
    isLoading: isLoadingProjectList,
  } = useQuery(listProject, {
    environmentId: activeEnvironment?.environment?.id,
  });

  useEffect(() => {
    setActivePage("dashboard");
  }, [activePage]);

  if (isLoadingProjectList) {
    return <LoadingIndicator message="Loading projects..." />;
  }

  return (
    <div className="mx-auto w-full px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your dashboards
            {/* TODO */} {/* and alerts */}
            organized by projects
          </p>
        </div>

        <Dialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[500px]">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your data visualizations.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <ProjectForm
                setIsProjectDialogOpen={setIsProjectDialogOpen}
                refetchProjectList={refetchProjectList}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projectList?.items && projectList.items.length > 0 ? (
        <div className="space-y-4">
          <Accordion
            type="multiple"
            value={Array.from(expandedProjects)}
            onValueChange={(value) => {
              setExpandedProjects(new Set(value));
            }}
          >
            {projectList.items.map((item) => {
              const project = item.project;
              if (!project?.spec?.name) return null;

              return (
                <ProjectContainer
                  key={project?.spec?.name}
                  project={project}
                  expandedProjects={expandedProjects}
                  setExpandedProjects={setExpandedProjects}
                />
              );
            })}
          </Accordion>
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto rounded-lg p-8">
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No projects found
            </h3>
            <p className="mb-6 text-gray-600">
              Get started by creating your first project to organize your
              dashboards and alerts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

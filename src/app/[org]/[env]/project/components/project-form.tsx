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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiClients } from "@/context/api-provider";
import { logger } from "@/lib/utils/telemetry/logger";
import { useMutation } from "@connectrpc/connect-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "api/js/svc/project/v1/service-ProjectService_connectquery";
import { CreateProjectRequestSchema } from "api/js/svc/project/v1/service_pb";
import {
  ProjectPointer,
  ProjectPointerSchema,
  ProjectPointer_LocalGitSchema,
  ProjectPointer_RemoteGitSchema,
  ProjectPointer_VirtualSchema,
} from "api/js/types/v1/project_pb";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ReadOnlyField } from "@/app/[org]/[env]/project/components/read-only-field";
import { create } from "@bufbuild/protobuf";
import { useEnvironmentStore } from "@/stores/environment-store";

// Project pointer type schemas
export const localhostProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  pointerType: z.literal("localhost"),
  path: z.string().min(1, "Path is required"),
  dashboardDir: z.string().min(1, "Dashboard directory is required"),
  alertDir: z.string().min(1, "Alert directory is required"),
  readOnly: z.boolean().default(true),
});

const remoteProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  pointerType: z.literal("remote"),
  remoteUrl: z.string().url("Must be a valid URL"),
  ref: z.string().min(1, "Git ref is required"),
  dashboardDir: z.string().min(1, "Dashboard directory is required"),
  alertDir: z.string().min(1, "Alert directory is required"),
});

const dbProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  pointerType: z.literal("db"),
  uri: z.string().min(1, "URI is required"),
});

// Union schema for stack creation
const stackFormSchema = z.discriminatedUnion("pointerType", [
  localhostProjectSchema,
  remoteProjectSchema,
  dbProjectSchema,
]);

type ProjectFormData = z.infer<typeof stackFormSchema>;

interface ProjectFormProps {
  setIsProjectDialogOpen: (isOpen: boolean) => void;
  refetchProjectList: () => void;
}

export const ProjectForm = ({
  setIsProjectDialogOpen,
  refetchProjectList,
}: ProjectFormProps) => {
  const { activeEnvironment } = useEnvironmentStore();

  const { mutate: createProjectMutation, isPending: isCreatingProject } =
    useMutation(createProject);

  const stackForm = useForm<ProjectFormData>({
    resolver: zodResolver(stackFormSchema),
    defaultValues: {
      name: "",
      pointerType: "localhost",
      path: "",
      dashboardDir: "",
      alertDir: "",
      readOnly: true,
    },
  });

  const onProjectSubmit = (data: ProjectFormData) => {
    const { name, pointerType } = data;

    let pointer: ProjectPointer;

    switch (pointerType) {
      case "localhost": {
        const { path, dashboardDir, alertDir, readOnly } = data;
        pointer = create(ProjectPointerSchema, {
          scheme: {
            case: "localhost",
            value: create(ProjectPointer_LocalGitSchema, {
              path,
              dashboardDir,
              alertDir,
              readOnly,
            }),
          },
        });
        break;
      }
      case "remote": {
        const { remoteUrl, ref, dashboardDir, alertDir } = data;
        pointer = create(ProjectPointerSchema, {
          scheme: {
            case: "remote",
            value: create(ProjectPointer_RemoteGitSchema, {
              remoteUrl,
              ref,
              dashboardDir,
              alertDir,
            }),
          },
        });
        break;
      }
      case "db": {
        const { uri } = data;
        pointer = create(ProjectPointerSchema, {
          scheme: {
            case: "db",
            value: create(ProjectPointer_VirtualSchema, {
              uri,
            }),
          },
        });
        break;
      }
      default:
        throw new Error("Invalid pointer type");
    }

    const newProject = create(CreateProjectRequestSchema, {
      environmentId: activeEnvironment?.environment?.id,
      spec: {
        name,
        pointer,
      },
    });

    createProjectMutation(newProject, {
      onSuccess: (response) => {
        logger.info("Project created successfully");
        toast.info("Project created successfully");
        setIsProjectDialogOpen(false);
        stackForm.reset();
        refetchProjectList();
      },
      onError: (error) => {
        toast.error(`Failed to create stack: ${error.message}`);
        logger.error(`Failed to create stack: ${error.message}`);
      },
    });
  };
  return (
    <Form {...stackForm}>
      <form
        onSubmit={stackForm.handleSubmit(onProjectSubmit)}
        className="space-y-4"
      >
        <FormField
          control={stackForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter stack name"
                  {...field}
                  disabled={isCreatingProject}
                />
              </FormControl>
              <FormDescription>
                Give your stack a descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={stackForm.control}
          name="pointerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Pointer Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pointer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="localhost">Localhost (GitOps)</SelectItem>
                  <SelectItem value="remote">Remote Git (GitOps)</SelectItem>
                  <SelectItem value="db">Database (UI Editable)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProjectPointerField
          stackForm={stackForm}
          isCreatingProject={isCreatingProject}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsProjectDialogOpen(false)}
            disabled={isCreatingProject}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreatingProject}>
            {isCreatingProject ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface ProjectPointerFieldProps {
  stackForm: UseFormReturn<ProjectFormData>;
  isCreatingProject: boolean;
}

const ProjectPointerField = ({
  stackForm,
  isCreatingProject,
}: ProjectPointerFieldProps) => {
  const POINTER_TYPE_CONFIGS = {
    localhost: {
      colorScheme: {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        icon: "text-emerald-600",
        text: "text-emerald-800 dark:text-emerald-200",
      },
      title: "Localhost",
      description:
        "Use a GitOps workflow by pointing to a localhost definition of your dashboards and alerts. Read-only: edits must be done on the files themselves. UI edits are ignored.",
      fields: [
        {
          name: "path" as const,
          label: "Path",
          placeholder: "/path/to/your/project",
        },
        {
          name: "dashboardDir" as const,
          label: "Dashboard Directory",
          placeholder: "dashboards",
        },
        {
          name: "alertDir" as const,
          label: "Alert Directory",
          placeholder: "alerts",
        },
      ],
    },
    remote: {
      colorScheme: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: "text-blue-600",
        text: "text-blue-800 dark:text-blue-200",
      },
      title: "Remote",
      description:
        "Use a GitOps workflow by pointing to a remote Git repository containing your dashboards and alerts. Read-only: edits must be done in the Git repository itself. UI edits are ignored.",
      fields: [
        {
          name: "remoteUrl" as const,
          label: "Remote URL",
          placeholder: "https://github.com/user/repo.git",
        },
        {
          name: "ref" as const,
          label: "Git Ref",
          placeholder: "main",
        },
        {
          name: "dashboardDir" as const,
          label: "Dashboard Directory",
          placeholder: "dashboards",
        },
        {
          name: "alertDir" as const,
          label: "Alert Directory",
          placeholder: "alerts",
        },
      ],
    },
    db: {
      colorScheme: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        icon: "text-purple-600",
        text: "text-purple-800 dark:text-purple-200",
      },
      title: "Database",
      description:
        "Save your dashboards and alerts in our database, and edit them in the UI. Ideal if you just want to craft dashboards quickly, without a GitOps workflow. You can later convert to a GitOps flow.",
      fields: [
        {
          name: "uri" as const,
          label: "URI",
          placeholder: "my-stack-uri",
        },
      ],
    },
  };

  const currentType = stackForm.watch("pointerType");
  const config = POINTER_TYPE_CONFIGS[currentType];

  if (!config) return null;

  return (
    <>
      <div
        className={`flex items-start gap-2 rounded-lg border p-3 ${config.colorScheme.bg}`}
      >
        <Info
          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.colorScheme.icon}`}
        />
        <div className={`text-sm ${config.colorScheme.text}`}>
          <strong>{config.title}:</strong> {config.description}
        </div>
      </div>
      {config.fields.map((fieldConfig) => (
        <FormField
          key={fieldConfig.name}
          control={stackForm.control}
          name={fieldConfig.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fieldConfig.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={fieldConfig.placeholder}
                  {...field}
                  disabled={isCreatingProject}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      {currentType === "localhost" && (
        <ReadOnlyField
          control={stackForm.control}
          readOnly={stackForm.watch("readOnly")}
          disabled={isCreatingProject}
          fieldName="readOnly"
        />
      )}
    </>
  );
};

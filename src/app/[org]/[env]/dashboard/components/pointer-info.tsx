// Component to display pointer information

import { Project } from "api/js/types/v1/project_pb";
import { Copy, Folder, GitBranch, Database } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface PointerInfoProps {
  project: Project;
}

const POINTER_INFO_CONFIGS = {
  localhost: {
    icon: Folder,
    iconClass: "h-4 w-4 text-emerald-600",
    title: "Local Git Repository",
    fields: [
      {
        key: "path",
        label: "Path",
        showCopy: true,
      },
      {
        key: "dashboardDir",
        label: "Dashboard Dir",
        showCopy: false,
      },
      {
        key: "alertDir",
        label: "Alert Dir",
        showCopy: false,
      },
    ],
  },
  remote: {
    icon: GitBranch,
    iconClass: "h-4 w-4 text-purple-600",
    title: "Remote Git Repository",
    fields: [
      {
        key: "remoteUrl",
        label: "Remote URL",
        showCopy: true,
      },
      {
        key: "ref",
        label: "Branch/Ref",
        showCopy: false,
      },
      {
        key: "dashboardDir",
        label: "Dashboard Dir",
        showCopy: false,
      },
      {
        key: "alertDir",
        label: "Alert Dir",
        showCopy: false,
      },
    ],
  },
  db: {
    icon: Database,
    iconClass: "h-4 w-4 text-blue-600",
    title: "Database",
    fields: [
      {
        key: "uri",
        label: "URI",
        showCopy: true,
      },
    ],
  },
};

export const PointerInfo = ({ project }: PointerInfoProps) => {
  const { pointer } = project;
  if (!pointer) return null;

  const { scheme } = pointer;
  if (!scheme) return null;

  const { case: pointerType, value } = scheme;

  const config =
    POINTER_INFO_CONFIGS[pointerType as keyof typeof POINTER_INFO_CONFIGS];
  if (!config) return null;

  const IconComponent = config.icon;
  const pointerData = value as any;

  const fieldsWithCopy = config.fields.filter((field) => field.showCopy);
  const fieldsWithoutCopy = config.fields.filter((field) => !field.showCopy);

  return (
    <div className="bg-muted/30 mb-6 rounded-lg border p-4">
      <h4 className="text-md mb-3 font-medium">Stack Configuration</h4>

      <div className="space-y-3">
        {/* Header with icon and title */}
        <div className="flex items-center gap-2">
          <IconComponent className={config.iconClass} />
          <span className="text-sm font-medium">{config.title}</span>
        </div>

        {/* Fields that need copy buttons */}
        {fieldsWithCopy.map((field) => {
          const fieldValue = pointerData[field.key];
          if (!fieldValue) return null;

          return (
            <div key={field.key} className="space-y-1">
              <label className="text-muted-foreground text-xs font-medium">
                {field.label}
              </label>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="bg-muted flex-1 cursor-help rounded px-2 py-1 font-mono text-sm">
                      {fieldValue}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{fieldValue}</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(fieldValue, field.label)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Fields without copy buttons - display in grid if multiple */}
        {fieldsWithoutCopy.length > 0 && (
          <div
            className={
              fieldsWithoutCopy.length > 1 ? "grid grid-cols-2 gap-3" : ""
            }
          >
            {fieldsWithoutCopy.map((field) => {
              const fieldValue = pointerData[field.key];
              if (!fieldValue) return null;

              return (
                <div key={field.key} className="space-y-1">
                  <label className="text-muted-foreground text-xs font-medium">
                    {field.label}
                  </label>
                  <code className="bg-muted block rounded px-2 py-1 font-mono text-xs">
                    {fieldValue}
                  </code>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

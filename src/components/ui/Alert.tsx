import React from "react";
import {
  InfoIcon,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "note" | "tip" | "warning" | "important" | "caution";

interface AlertProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const icons = {
  note: InfoIcon,
  tip: Lightbulb,
  warning: AlertTriangle,
  important: AlertCircle,
  caution: AlertOctagon,
};

const alertStyles = {
  note: "border-blue-200 text-blue-800 dark:border-blue-900 dark:text-blue-300",
  tip: "border-green-200 text-green-800 dark:border-green-900 dark:text-green-300",
  warning:
    "border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-300",
  important:
    "border-purple-200 text-purple-800 dark:border-purple-900 dark:text-purple-300",
  caution: "border-red-200 text-red-800 dark:border-red-900 dark:text-red-300",
};

const defaultTitles = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  important: "Important",
  caution: "Caution",
};

export function Alert({ type, title, children, className }: AlertProps) {
  const Icon = icons[type];
  const alertTitle = title || defaultTitles[type];

  return (
    <div className={cn("my-6 border-l-4 p-4", alertStyles[type], className)}>
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-5 w-5" />
        <span>{alertTitle}</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

// Export specific alert components for easier usage in MDX
export function Note(props: Omit<AlertProps, "type">) {
  return <Alert type="note" {...props} />;
}

export function Tip(props: Omit<AlertProps, "type">) {
  return <Alert type="tip" {...props} />;
}

export function Warning(props: Omit<AlertProps, "type">) {
  return <Alert type="warning" {...props} />;
}

export function Important(props: Omit<AlertProps, "type">) {
  return <Alert type="important" {...props} />;
}

export function Caution(props: Omit<AlertProps, "type">) {
  return <Alert type="caution" {...props} />;
}

import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        className,
      )}
    >
      BETA
    </span>
  );
}

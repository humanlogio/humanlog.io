import { MessageCircleWarning } from "lucide-react";

export const NoLogsView = () => {
  return (
    <div className="rounded-md bg-slate-200 p-4 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-2">
        <MessageCircleWarning size={20} />
        <h4 className="font-bold">No logs were found given that query.</h4>
      </div>
      <p className="mt-2 text-sm">
        Try adjusting your query or time range. If still no data is coming
        through, please check that the log source is configured correctly.
      </p>
    </div>
  );
};

import { MessageCircleWarning } from "lucide-react";

interface EmptyDataViewProps {
  dataType?: string;
  showBackground?: boolean;
}

export const EmptyDataView = ({
  dataType = "data",
  showBackground = true,
}: EmptyDataViewProps) => {
  return (
    <div className={`rounded-md p-4 ${showBackground && "bg-muted"}`}>
      <div className="flex items-center gap-2">
        <MessageCircleWarning size={20} />
        <h4 className="font-bold">No {dataType} found given that query.</h4>
      </div>
      <p className="mt-2 text-sm">
        Try adjusting your query or time range. If still no data is coming
        through, please check that the log source is configured correctly.
      </p>
    </div>
  );
};

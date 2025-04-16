import { TooltipContent } from "@/components/ui/tooltip";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { KeyValueRow } from "@/components/sortable/new-session-panel/key-value-row";
import { formatTimestamp, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf";

interface MetaDataTooltipProps {
  log: IngestedLogEvent;
}

export const MetaDataTooltip = ({ log }: MetaDataTooltipProps) => {
  return (
    <TooltipContent align="start">
      <div>
        <KeyValueRow label="Machine Id" value={log.machineId.toString()} />
        <KeyValueRow label="Session Id" value={log.sessionId.toString()} />
        <KeyValueRow label="Event Id" value={log.eventId.toString()} />
        <KeyValueRow
          label="Local"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            "Jan _2 15:04:05.000",
          )}
        />
        <KeyValueRow
          label="UTC"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            "Jan _2 15:04:05.000",
            true,
          )}
        />
        <KeyValueRow
          label="Timestamp"
          value={getUnixTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
          ).toString()}
        />
      </div>
    </TooltipContent>
  );
};

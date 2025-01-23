import { Duration, Timestamp } from "@bufbuild/protobuf";
import dayjs from "dayjs";

export const formatTimestamp = (timestamp: Timestamp | Duration) => {
  const milliseconds =
    Number(timestamp?.seconds) * 1000 +
    (timestamp?.nanos ? timestamp?.nanos / 1e6 : 0);
  return dayjs(milliseconds).toISOString();
};

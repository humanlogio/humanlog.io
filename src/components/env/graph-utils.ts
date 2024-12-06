import { SummarizeEventsResponse_Bucket } from "api/js/svc/query/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";

const formatToDateString = (time: Timestamp, diff: number) => {
  if (diff > 1000 * 60 * 60 * 24 * 30 * 12 * 2) {
    // years
    return time.toDate().toLocaleDateString("en-US", {
      year: "numeric",
    });
  }
  if (diff > 1000 * 60 * 60 * 24 * 30 * 2) {
    // months
    return time.toDate().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  if (diff > 1000 * 60 * 60 * 24 * 7) {
    // days
    return time.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  }
  if (diff > 1000 * 60 * 60 * 24 * 2) {
    // weekday
    return time.toDate().toLocaleDateString("en-US", {
      weekday: "short",
      dayPeriod: "short",
    });
  }
  if (diff > 1000 * 60 * 10) {
    // hours
    return time.toDate().toLocaleTimeString("en-US", {
      hourCycle: "h24",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // minutes
  return time.toDate().toLocaleTimeString("en-US", {
    hourCycle: "h24",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
};

export const convertToTimestamp = (date: Date) =>
  new Timestamp({
    seconds: BigInt(Math.floor(date.getTime() / 1000)),
    nanos: (date.getTime() % 1000) * 1e6,
  });

export const convertToGraphDataPoints = (
  buckets: SummarizeEventsResponse_Bucket[],
  startDate: Date,
  endDate: Date | null,
) => {
  const diff = Math.abs(
    startDate.getTime() - (endDate ?? new Date()).getTime(),
  );
  return buckets
    .filter((data) => data?.ts)
    .map((data, i) => ({
      dayNumber: i,
      name: formatToDateString(
        data?.ts ?? convertToTimestamp(new Date()),
        diff,
      ),
      date: data.ts!.toDate(),
      amt: Number(data.eventCount),
    }));
};

export const closestIndex = (
  buckets: SummarizeEventsResponse_Bucket[],
  targetDate: Date,
) =>
  buckets.reduce((closest, bucket, index) => {
    const currentTs = bucket.ts?.toDate();
    if (!currentTs) return closest;

    const currentDiff = Math.abs(currentTs.getTime() - targetDate.getTime());
    const closestTime = buckets[closest]?.ts?.toDate()?.getTime();
    if (!closestTime) {
      return index;
    }

    const closestDiff = Math.abs(closestTime - targetDate.getTime());

    return currentDiff < closestDiff ? index : closest;
  }, 0);

import { Duration, Timestamp } from "@bufbuild/protobuf";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const TIME_FORMAT = {
  "YYYY-MM-DDTHH:mm:ssZ": "2006-01-02T15:04:05-0700",
  "MMM D HH:mm:ss.SSS": "Jan _2 15:04:05.000",
  "MMM D HH:mm:ss": "Jan 2 15:04:05",
  "YYYY-MM-DD HH:mm:ss": "2006-01-02 15:04:05",
  "ddd MMM D HH:mm:ss YYYY": "Mon Jan 2 15:04:05 2006",
  "ddd MMM D HH:mm:ss z YYYY": "Mon Jan 2 15:04:05 MST 2006",
  "ddd MMM DD HH:mm:ss ZZ YYYY": "Mon Jan 02 15:04:05 -0700 2006",
  "h:mmA": "3:04pm",
  "YYYY/MM/DD HH:mm:ss": "2006/01/02 15:04:05",
  "DD/MM/YYYY HH:mm:ss": "02/01/2006 15:04:05",
  "MM/DD/YYYY HH:mm:ss": "01/02/2006 15:04:05",
  "MM-DD HH:mm:ss": "01-02 15:04:05",
  "HH:mm:ss": "15:04:05",
  "HH:mm:ss.SSS": "15:04:05.000",
};

export const findTimeFormatKey = (formatValue: string) => {
  return Object.entries(TIME_FORMAT).find(
    ([key, value]) => value === formatValue,
  )?.[0];
};

export const formatTimestamp = (
  timestamp: Timestamp | Duration,
  formatValue?: string,
  isUtc?: boolean,
) => {
  let dayjsObj;

  const milliseconds =
    Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1_000_000);

  dayjsObj = dayjs(milliseconds);

  if (formatValue) {
    const format = findTimeFormatKey(formatValue);
    return isUtc
      ? dayjs.utc(dayjsObj).format(format)
      : dayjs(dayjsObj).format(format);
  }

  return isUtc
    ? dayjs.utc(dayjsObj).format(Object.keys(TIME_FORMAT)[0])
    : dayjs(dayjsObj).format(Object.keys(TIME_FORMAT)[0]);
};

export const getUnixTimestamp = (timestamp: Timestamp) => {
  const seconds = Number(timestamp.seconds);
  const milliseconds = Math.floor(timestamp.nanos / 1_000_000);

  return seconds * 1000 + milliseconds;
};

export const getTimeSince = (timestamp: Timestamp) => {
  const unixTimestamp = getUnixTimestamp(timestamp);

  return dayjs(unixTimestamp).fromNow();
};

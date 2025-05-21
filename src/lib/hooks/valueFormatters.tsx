import { Duration } from "@bufbuild/protobuf";
import { Scalar, Val } from "api/js/types/v1/types_pb";
import { ReactNode } from "react";

export const valueToJSX = (val: Val | Scalar | undefined): ReactNode => {
  if (!val) {
    return <>null</>;
  }
  switch (val.kind.case) {
    case "str":
      return <span className="">{val.kind.value}</span>;
    case "f64":
      return <span className="">{val.kind.value}</span>;
    case "i64":
      return <span className="">{val.kind.value}</span>;
    case "bool":
      return <span className="">{val.kind.value}</span>;
    case "arr":
      return <span className="">{JSON.stringify(val.kind.value)}</span>;
    case "obj":
      return <span className="">{JSON.stringify(val.kind.value)}</span>;
    case "ts":
      return <span className="">{val.kind.value.toDate().toISOString()}</span>;
    case "dur":
      return <span className="">{durationToString(val.kind.value)}</span>;
  }
  return (
    <span className="dark:text-redqu-400 text-red-600">
      {/* buggy UI is buggy: {val.kind.value} */}
    </span>
  );
};

const durationToString = (dur: Duration): string => {
  if (dur.seconds === BigInt(0)) {
    // sub-second duration
    if (dur.nanos > 1e6) {
      return wholeOrSingleDecimal(dur.nanos, 1e6) + "ms";
    } else if (dur.nanos > 1e3) {
      return wholeOrSingleDecimal(dur.nanos, 1e3) + "µs";
    } else {
      return dur.nanos + "ns";
    }
  }
  if (dur.seconds < 10) {
    if (dur.nanos > 0) {
      // note that "1s == 1e9ns" and thus "0.1s == 1e8ns"
      const decisecond = wholeOrSingleDecimal(dur.nanos, 1e8);
      return Number(dur.seconds) + "." + decisecond + "s";
    }
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < 120) {
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < 60 * 60) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60) + "m";
  }
  if (dur.seconds < 24 * 60 * 60) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60 * 60) + "m";
  }
  return dur.toJsonString();
};

const wholeOrSingleDecimal = (
  num: number,
  orderOfMagnitude: number,
): number => {
  if (num % orderOfMagnitude === 0) {
    // wholly divisible by millisecond
    return num / orderOfMagnitude;
  }
  // scale up and down to keep 1 decimal
  return Math.round((10 * num) / orderOfMagnitude) / 10;
};

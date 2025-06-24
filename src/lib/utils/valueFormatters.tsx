import { Duration } from "@bufbuild/protobuf";
import { Scalar, Val, VarType, ScalarType } from "api/js/types/v1/types_pb";
import { decodeUint8Array } from "@/lib/utils/decode";

export const valueToString = (val: Val | Scalar | undefined): string => {
  if (!val) {
    return "null";
  }
  switch (val.kind.case) {
    case "str":
      return val.kind.value;
    case "f64":
      return val.kind.value.toString();
    case "i64":
      return val.kind.value.toString();
    case "bool":
      return val.kind.value.toString();
    case "arr":
      return JSON.stringify(val.kind.value);
    case "obj":
      return JSON.stringify(val.kind.value);
    case "ts":
      return val.kind.value.toDate().toISOString();
    case "dur":
      return durationToString(val.kind.value);
    case "map":
      return JSON.stringify(val.kind.value);
    case "null":
      return "null";
    case "blob":
      return decodeUint8Array(val.kind.value);
    default:
      return "unknown";
  }
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

/**
 * Convert VarType to human-readable string
 */
export const varTypeToString = (varType: VarType | undefined): string => {
  if (!varType?.type?.case) return "unknown";

  const typeCase = varType.type.case;

  switch (typeCase) {
    case "scalar":
      const scalarType = varType.type.value;
      return scalarTypeToString(scalarType);
    case "array":
      return "array";
    case "map":
      return "map";
    case "object":
      return "object";
    case "null":
      return "null";
    default:
      return typeCase;
  }
};

/**
 * Convert ScalarType enum to string
 */
export const scalarTypeToString = (scalarType: ScalarType): string => {
  switch (scalarType) {
    case ScalarType.unknown:
      return "unknown";
    case ScalarType.str:
      return "string";
    case ScalarType.f64:
      return "float64";
    case ScalarType.i64:
      return "int64";
    case ScalarType.bool:
      return "boolean";
    case ScalarType.ts:
      return "timestamp";
    case ScalarType.dur:
      return "duration";
    case ScalarType.blob:
      return "blob";
    default:
      return `scalar(${scalarType})`;
  }
};

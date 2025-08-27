import { Duration } from "@bufbuild/protobuf";
import { Scalar, Val, VarType, ScalarType } from "api/js/types/v1/types_pb";
import { decodeUint8Array } from "@/lib/utils/decode";
import {
  spanIdToString,
  traceIdToString,
  ulidToString,
} from "@/lib/utils/id-factories";

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
    case "traceId":
      return traceIdToString(val.kind.value);
    case "spanId":
      return spanIdToString(val.kind.value);
    case "ulid":
      return ulidToString(val.kind.value);
    default:
      return "unknown";
  }
};

export const wholeOrSingleDecimal = (
  value: number,
  divisor: number,
): string => {
  const result = value / divisor;
  const rounded = Math.round(result * 10) / 10;
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  return rounded.toFixed(1);
};

export const durationToString = (dur: Duration): string => {
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
  if (dur.seconds < BigInt(10)) {
    if (dur.nanos > 0) {
      const decisecond = Math.round(dur.nanos / 1e8);
      return Number(dur.seconds) + "." + decisecond + "s";
    }
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < BigInt(120)) {
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < BigInt(60 * 60)) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60) + "m";
  }
  if (dur.seconds < BigInt(24 * 60 * 60)) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60 * 60) + "h";
  }
  return dur.toJsonString();
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
  console.log("scalarType", scalarType);
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
    case ScalarType.trace_id:
      return "trace_id";
    case ScalarType.span_id:
      return "span_id";
    case ScalarType.ulid:
      return "ulid";
    default:
      return `scalar(${scalarType})`;
  }
};

import { Duration, Timestamp } from "@bufbuild/protobuf";
import { Null, Val, VarType } from "api/js/types/v1/types_pb";

export const newNullVal = (): Val => {
  return new Val({
    type: new VarType({}),
    kind: {
      case: "null",
      value: Null,
    },
  });
};

export const newStrVal = (v: string | undefined): Val => {
  if (!v) {
    return newNullVal();
  }
  return new Val({
    type: new VarType({}),
    kind: {
      case: "str",
      value: v,
    },
  });
};

export const newI64Val = (v: bigint | number | undefined): Val => {
  if (!v) {
    return newNullVal();
  }
  return new Val({
    type: new VarType({}),
    kind: {
      case: "i64",
      value: BigInt(v),
    },
  });
};

export const newF64Val = (v: number | undefined): Val => {
  if (!v) {
    return newNullVal();
  }
  return new Val({
    type: new VarType({}),
    kind: {
      case: "f64",
      value: v,
    },
  });
};

export const newDurationVal = (v: Duration | undefined): Val => {
  if (!v) {
    return newNullVal();
  }
  return new Val({
    type: new VarType({}),
    kind: {
      case: "dur",
      value: v,
    },
  });
};

export const newTimestampVal = (v: Timestamp | undefined): Val => {
  if (!v) {
    return newNullVal();
  }
  return new Val({
    type: new VarType({}),
    kind: {
      case: "ts",
      value: v,
    },
  });
};

// Helper for BigInt (avoids BigInt literals for ES2019 compatibility)
export const toBigInt = (val: number | string): any => {
  // Use BigInt if available, otherwise fallback to string (for proto compatibility)
  // Typescript will accept string for proto fields expecting bigint
  try {
    // @ts-ignore
    return typeof BigInt !== "undefined" ? BigInt(val) : String(val);
  } catch {
    return String(val);
  }
};

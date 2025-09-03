import { Duration, Timestamp } from "@bufbuild/protobuf/wkt";
import { KV, KVSchema } from "api/js/types/v1/types_pb";
import { create } from "@bufbuild/protobuf";
import {
  newDurationVal,
  newF64Val,
  newI64Val,
  newNullVal,
  newStrVal,
  newTimestampVal,
} from "@/lib/utils/valueFactories";

// Helper functions for key-value pairs
export const makeStrKV = (key: string, value: string): KV => {
  return create(KVSchema, { key, value: newStrVal(value) });
};

export const makeI64KV = (key: string, value: number | bigint): KV => {
  return create(KVSchema, { key, value: newI64Val(value) });
};

export const makeF64KV = (key: string, value: number): KV => {
  return create(KVSchema, { key, value: newF64Val(value) });
};

export const makeTimestampKV = (key: string, value: Timestamp): KV => {
  return create(KVSchema, { key, value: newTimestampVal(value) });
};

export const makeDurationKV = (key: string, value: Duration): KV => {
  return create(KVSchema, { key, value: newDurationVal(value) });
};

export const makeNullKV = (key: string): KV => {
  return create(KVSchema, { key, value: newNullVal() });
};

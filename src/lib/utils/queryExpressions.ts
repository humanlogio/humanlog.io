import {
  Expr,
  Identifier,
  Indexor,
  BinaryOp_Operator,
} from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";
import { Timestamp } from "@bufbuild/protobuf";
import {
  newF64Val,
  newI64Val,
  newStrVal,
  newTimestampVal,
} from "@/lib/utils/valueFactories";

export const newBinaryExpr = (
  lhs: Expr,
  op: BinaryOp_Operator,
  rhs: Expr,
): Expr => {
  return new Expr({
    expr: {
      case: "binary",
      value: {
        lhs: lhs,
        rhs: rhs,
        op: op,
      },
    },
  });
};

export const newIdentifierExpr = (id: string): Expr => {
  return new Expr({
    expr: {
      case: "identifier",
      value: new Identifier({ name: id }),
    },
  });
};

export const newIndexorExpr = (x: Expr, index: Expr): Expr => {
  return new Expr({
    expr: {
      case: "indexor",
      value: new Indexor({ x: x, index: index }),
    },
  });
};

export const newLiteralExpr = (val: Val): Expr => {
  return new Expr({
    expr: {
      case: "literal",
      value: val,
    },
  });
};

export const newFunctionExpr = (funcname: string, args: Expr[]): Expr => {
  return new Expr({
    expr: {
      case: "funcCall",
      value: {
        name: funcname,
        args: args,
      },
    },
  });
};

export const newI64Expr = (v: bigint | number | undefined): Expr => {
  return newLiteralExpr(newI64Val(v));
};

export const newF64Expr = (v: number | undefined): Expr => {
  return newLiteralExpr(newF64Val(v));
};

export const newStrExpr = (v: string | undefined): Expr => {
  return newLiteralExpr(newStrVal(v));
};

export const newTimestampExpr = (v: Timestamp | undefined): Expr => {
  return newLiteralExpr(newTimestampVal(v));
};

export const newTimestamp = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  seconds: number,
  subseconds: number,
): Expr => {
  const timestamp = newFunctionExpr("make_timestamp", [
    newI64Expr(year),
    newI64Expr(month),
    newI64Expr(day),
    newI64Expr(hour),
    newI64Expr(minute),
    newI64Expr(seconds),
    newF64Expr(subseconds),
  ]);
  return timestamp;
};

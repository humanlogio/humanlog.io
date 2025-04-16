import {
  BinaryOp_Operator,
  Expr,
  Identifier,
} from "api/js/types/v1/logquery_pb";
import { ScalarType, Val, VarType } from "api/js/types/v1/types_pb";

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

export const newStrVal = (str: string): Val => {
  return new Val({
    type: new VarType({}),
    kind: {
      case: "str",
      value: str,
    },
  });
};

export const newI64Val = (v: bigint): Val => {
  return new Val({
    type: new VarType({}),
    kind: {
      case: "i64",
      value: v,
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

export const newLiteralExpr = (val: Val): Expr => {
  return new Expr({
    expr: {
      case: "literal",
      value: val,
    },
  });
};

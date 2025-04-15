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
  const type = new VarType({
    1: {
      value: ScalarType.str,
      case: "scalar",
    },
  });
  return new Val({
    type: type,
    kind: {
      case: "str",
      value: str,
    },
  });
};

export const newI64Val = (v: bigint): Val => {
  const type = new VarType({
    1: {
      value: ScalarType.i64,
      case: "scalar",
    },
  });
  return new Val({
    type: type,
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

// const newFilterStmt = (expr: Expr): Statement => {
//   // return
// }

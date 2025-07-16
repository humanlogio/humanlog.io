import { BinaryOp, Query } from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";

export const extractQueryIds = (query: Query) => {
  let sessionId = undefined;
  let machineId = undefined;
  // TODO
  // if (
  //   query.context?.sessionId?.expr.value instanceof BinaryOp &&
  //   query.context?.machineId?.expr.value instanceof BinaryOp
  // ) {
  //   const { value: sessionValue } = query.context?.sessionId?.expr;
  //   const { value: machineValue } = query.context?.machineId?.expr;
  //   if (
  //     sessionValue.rhs?.expr.value instanceof Val &&
  //     machineValue.rhs?.expr.value instanceof Val
  //   ) {
  //     const {
  //       kind: { value: _sessionId },
  //     } = sessionValue.rhs?.expr.value;
  //     const {
  //       kind: { value: _machineId },
  //     } = machineValue.rhs?.expr.value;
  //     sessionId = _sessionId?.toString();
  //     machineId = _machineId?.toString();
  //   }
  // }
  return { sessionId, machineId };
};

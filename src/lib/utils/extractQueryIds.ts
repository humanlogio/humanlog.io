import { BinaryOp, Query } from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";

export const extractQueryIds = (query: Query) => {
  let resourceFingerprint;

  if (query.context?.resourceFingerprint?.expr.value instanceof BinaryOp) {
    const { value: resourceFingerprintValue } =
      query.context?.resourceFingerprint?.expr;

    if (resourceFingerprintValue.rhs?.expr.value instanceof Val) {
      const {
        kind: { value: _resourceFingerprint },
      } = resourceFingerprintValue.rhs?.expr.value;

      resourceFingerprint = _resourceFingerprint?.toString();
    }
  }
  return resourceFingerprint;
};

import { BinaryOp, Query } from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";

export const extractQueryIds = (query: Query) => {
  let resourceFingerprint;

  if (
    query.context?.resourceFingerprint?.expr?.case === "binary" &&
    query.context.resourceFingerprint.expr.value
  ) {
    const resourceFingerprintValue =
      query.context.resourceFingerprint.expr.value;

    if (
      resourceFingerprintValue.rhs?.expr?.case === "literal" &&
      resourceFingerprintValue.rhs.expr.value
    ) {
      const literalValue = resourceFingerprintValue.rhs.expr.value;

      if (literalValue.kind?.case && literalValue.kind.value) {
        resourceFingerprint = literalValue.kind.value.toString();
      }
    }
  }
  return resourceFingerprint;
};

import { BinaryOp_Operator } from "api/js/types/v1/logquery_pb";
import { KV } from "api/js/types/v1/types_pb";

interface FilterByKeyValueProps {
  kv: KV;
  onClickFilterBy: (kv: KV, op?: BinaryOp_Operator) => void;
}

export const FilterByKeyValue = ({
  kv,
  onClickFilterBy,
}: FilterByKeyValueProps) => {
  const OPERATORS = [
    {
      label: "equals (==)",
      value: BinaryOp_Operator.CMP_EQ,
      cases: ["str", "i64", "default"],
    },
    {
      label: "not equals (!=)",
      value: BinaryOp_Operator.CMP_NOTEQ,
      cases: ["str", "i64", "default"],
    },
    {
      label: "contains",
      value: BinaryOp_Operator.STR_CONTAINS,
      cases: ["str"],
    },
    {
      label: "starts with",
      value: BinaryOp_Operator.STR_STARTSWITH,
      cases: ["str"],
    },
    {
      label: "ends with",
      value: BinaryOp_Operator.STR_ENDSWITH,
      cases: ["str"],
    },
    {
      label: "greater than (>)",
      value: BinaryOp_Operator.CMP_GT,
      cases: ["i64"],
    },
    {
      label: "greater than or equals (>=)",
      value: BinaryOp_Operator.CMP_GTE,
      cases: ["i64"],
    },
    { label: "less than (<)", value: BinaryOp_Operator.CMP_LT, cases: ["i64"] },
    {
      label: "less than or equals (<=)",
      value: BinaryOp_Operator.CMP_LTE,
      cases: ["i64"],
    },
  ];

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <div className="mb-2 flex w-auto flex-wrap gap-1">
        {OPERATORS.filter((op) => {
          const valueCase = kv.value?.kind.case || "default";
          return op.cases.includes(valueCase);
        }).map((op, index) => (
          <button
            key={`${kv.key}-${op.value}-${index}`}
            className="bg-muted rounded px-2 py-1 text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            onClick={() => onClickFilterBy && onClickFilterBy(kv, op.value)}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
};

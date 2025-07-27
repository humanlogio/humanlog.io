/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse("{\"name\":\"exp\",\"implemented\":true,\"desc\":\"Computes the value of e (the base of natural logarithms, approximately 2.71828) raised to the power of the input value. Accepts numeric input (f64 or i64) and returns an f64 result.\",\"usage\":\"Calculates e raised to the power of the specified input.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"exp(x), return e^'x'\",\"input\":[{\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0.0}\"},{\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1.0}\"}],\"query\":\"project exp=exp(['x'])\",\"output\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"exp\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1}]},{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":2.718281828459045}]}]}}},{\"name\":\"exp(x), return e^'x' where 'x' is a numeric literal\",\"input\":[{\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project exp=exp(1)\",\"output\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"exp\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":2.718281828459045}]}]}}}]}") as ScalarFuncType;

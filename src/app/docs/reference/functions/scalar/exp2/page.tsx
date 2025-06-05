/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse("{\"name\":\"exp2\",\"implemented\":true,\"desc\":\"Computes the value of 2 raised to the power of the input value. Accepts numeric input (f64 or i64) and returns an f64 result.\",\"usage\":\"Calculates 2 raised to the power of the specified input.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"exp2(x), return 2^'x'\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0.0}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":2,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1.0}\"}],\"query\":\"project exp2=exp2(['x'])\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"exp2\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1}]},{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":2}]}]}}}},{\"name\":\"exp2(x), return 2^'x' where 'x' is a numeric literal\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project exp2=exp2(10)\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"exp2\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1024}]}]}}}}]}") as ScalarFuncType;

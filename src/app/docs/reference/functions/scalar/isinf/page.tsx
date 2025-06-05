/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse("{\"name\":\"isinf\",\"implemented\":true,\"desc\":\"Determines whether the provided numeric value is positive or negative infinity. Returns true if the value is infinite, false otherwise. Accepts numeric input (f64 or i64) and returns a boolean result.\",\"usage\":\"Tests whether a number is infinite.\",\"category\":\"validation\",\"signatures\":[{\"return_type\":\"scalar:bool\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:bool\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"isinf(x), return true if 'x' is infinite\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1}\"}],\"query\":\"project isinf=isinf(['x'])\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"isinf\",\"type\":{\"scalar\":\"bool\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"bool\"},\"bool\":false}]}]}}}},{\"name\":\"isinf(x), where 'x' is numeric literal\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project isinf=isinf(1)\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"isinf\",\"type\":{\"scalar\":\"bool\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"bool\"},\"bool\":false}]}]}}}}]}") as ScalarFuncType;

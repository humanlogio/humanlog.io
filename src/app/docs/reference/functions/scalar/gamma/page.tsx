/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export default function Page() {
  return <Func func={func} />;
}
  
const func: ScalarFuncType = JSON.parse("{\"name\":\"gamma\",\"implemented\":true,\"desc\":\"Computes the gamma function for the input value. The gamma function extends the factorial function to non-integer and complex numbers. Accepts numeric input (f64 or i64) and returns an f64 result.\",\"usage\":\"Calculates the gamma function for the specified input.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"gamma(x), gamma function of 'x' referenced from the log data\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 100}\"}],\"query\":\"project gamma=gamma(['x'])\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"gamma\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":9.332621544394415e+155}}]}]}}}}}},{\"name\":\"gamma(x), gamma function of numeric literal 'x'\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project gamma=gamma(100)\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"gamma\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":9.332621544394423e+155}}]}]}}}}}}]}") as ScalarFuncType;

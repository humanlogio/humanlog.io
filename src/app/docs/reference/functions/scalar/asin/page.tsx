/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export default function Page() {
  return <Func func={func} />;
}
  
const func: ScalarFuncType = JSON.parse("{\"name\":\"asin\",\"implemented\":true,\"desc\":\"Computes the arcsine (inverse sine) of the input value. Input must be between -1 and 1, inclusive. Accepts numeric input (f64 or i64) and returns an f64 result in radians between -π/2 and π/2. Returns NaN if the input is outside the valid range.\",\"usage\":\"Calculates the arcsine (inverse sine) of a value between -1 and 1.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"asin(x), return arcsine of 'x' referenced from the log data\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0.0}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":2,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0.5}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":3,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1.0}\"}],\"query\":\"project asin=asin(['x'])\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"asin\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0.5235987755982989}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":1.5707963267948966}}]}]}}}}}},{\"name\":\"asin(x), return arcsine of numeric literal 'x'\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project asin=asin(0)\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"asin\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0}}]}]}}}}}}]}") as ScalarFuncType;

/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export default function Page() {
  return <Func func={func} />;
}
  
const func: ScalarFuncType = JSON.parse("{\"name\":\"atan\",\"implemented\":true,\"desc\":\"Computes the arctangent (inverse tangent) of the input value. Accepts numeric input (f64 or i64) and returns an f64 result in radians between -π/2 and π/2.\",\"usage\":\"Calculates the arctangent (inverse tangent) of a value.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"atan(x), return arctangent of 'x' referenced from the log data\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0.0}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":2,\"parsedAt\":\"2006-01-02T15:04:06.002Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.002\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1.0}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":3,\"parsedAt\":\"2006-01-02T15:04:06.003Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.003\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": -1.0}\"}],\"query\":\"project atan=atan(['x'])\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"atan\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0.7853981633974483}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":-0.7853981633974483}}]}]}}}}}},{\"name\":\"atan(x), return arctangent of numeric literal 'x'\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project atan=atan(1)\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"atan\",\"type\":{\"Type\":{\"Scalar\":2}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":2}},\"Kind\":{\"F64\":0.7853981633974483}}]}]}}}}}}]}") as ScalarFuncType;

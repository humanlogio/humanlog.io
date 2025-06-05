/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse("{\"name\":\"abs\",\"implemented\":true,\"desc\":\"Computes the absolute value (magnitude without sign) of the input numeric expression. Accepts f64, i64, or duration inputs and returns a value of the same type. Converts negative values to positive while leaving positive values unchanged.\",\"usage\":\"Returns the absolute value of a number.\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:f64\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"abs(x), return absolute value of 'x' referenced from the log data\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": -1}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":2,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 0}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":3,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1}\"}],\"query\":\"project abs=abs(['x'])\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"abs\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1}]},{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":0}]},{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1}]}]}}}},{\"name\":\"abs(x), return absolute value of numeric literal 'x'\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project abs=abs(-1.0)\",\"output\":{\"tabular\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"abs\",\"type\":{\"scalar\":\"f64\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"f64\"},\"f64\":1}]}]}}}}]}") as ScalarFuncType;

/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse("{\"name\":\"isfinite\",\"implemented\":true,\"desc\":\"Determines whether the provided numeric value is finite. Returns true if the value is neither infinite nor NaN (Not a Number), false otherwise. Accepts numeric input (f64 or i64) and returns a boolean result.\",\"usage\":\"Tests whether a number is finite (not infinite and not NaN).\",\"category\":\"validation\",\"signatures\":[{\"return_type\":\"scalar:bool\",\"arg_types\":[\"scalar:f64\"]},{\"return_type\":\"scalar:bool\",\"arg_types\":[\"scalar:i64\"]}],\"examples\":[{\"name\":\"isfinite(x), return true if 'x' is a finite number\",\"input\":[{\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\", \\\"x\\\": 1}\"}],\"query\":\"project isfinite=isfinite(['x'])\",\"output\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"isfinite\",\"type\":{\"scalar\":\"bool\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"bool\"},\"bool\":true}]}]}}},{\"name\":\"isfinite(x), where 'x' is numeric literal\",\"input\":[{\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"info\\\"}\"}],\"query\":\"project isfinite=isfinite(1)\",\"output\":{\"freeForm\":{\"type\":{\"columns\":[{\"name\":\"isfinite\",\"type\":{\"scalar\":\"bool\"}}]},\"rows\":[{\"items\":[{\"type\":{\"scalar\":\"bool\"},\"bool\":true}]}]}}}]}") as ScalarFuncType;

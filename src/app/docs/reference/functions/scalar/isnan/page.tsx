/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse(
  '{"name":"isnan","implemented":true,"desc":"Determines whether the provided value is NaN (Not a Number). Returns true only if the value is specifically NaN, false otherwise. Accepts numeric input (f64 or i64) and returns a boolean result.","usage":"Tests whether a value is NaN (Not a Number).","category":"validation","signatures":[{"return_type":"scalar:bool","arg_types":["scalar:f64"]},{"return_type":"scalar:bool","arg_types":["scalar:i64"]}],"examples":[{"name":"isnan(x), return true if \'x\' is NaN","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1}"}],"query":"project isnan=isnan([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"isnan","type":{"scalar":"bool"}}]},"rows":[{"items":[{"type":{"scalar":"bool"},"bool":false}]}]}}},{"name":"isnan(x), where \'x\' is numeric literal","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project isnan=isnan(1)","output":{"freeForm":{"type":{"columns":[{"name":"isnan","type":{"scalar":"bool"}}]},"rows":[{"items":[{"type":{"scalar":"bool"},"bool":false}]}]}}}]}',
) as ScalarFuncType;

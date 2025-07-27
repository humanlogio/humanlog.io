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
  '{"name":"sin","implemented":true,"desc":"Computes the sine of the input angle (specified in radians). Accepts numeric input (f64 or i64) and returns an f64 result between -1 and 1, inclusive.","usage":"Calculates the sine of an angle specified in radians.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"sin(x), return sine of \'x\' referenced from the log data","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.523598775598298815}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.570796326794896557}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 2.617993877991494411}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 3.141592653589793115}"}],"query":"project sin=sin([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"sin","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":0}]},{"items":[{"type":{"scalar":"f64"},"f64":0.5}]},{"items":[{"type":{"scalar":"f64"},"f64":1}]},{"items":[{"type":{"scalar":"f64"},"f64":0.5}]},{"items":[{"type":{"scalar":"f64"},"f64":0}]}]}}},{"name":"sin(x), return sine of numeric literal \'x\'","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project sin=sin(1.570796326794896558)","output":{"freeForm":{"type":{"columns":[{"name":"sin","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":1}]}]}}}]}',
) as ScalarFuncType;

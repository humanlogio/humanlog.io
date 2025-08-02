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
  '{"name":"cos","implemented":true,"desc":"Computes the cosine of the input angle (specified in radians). Accepts numeric input (f64 or i64) and returns an f64 result between -1 and 1, inclusive.","usage":"Calculates the cosine of an angle specified in radians.","category":"math","signatures":[{"return_type":"f64","arg_types":["f64"]},{"return_type":"f64","arg_types":["i64"]}],"examples":[{"name":"cos(x), return cosine of \'x\' referenced from the log data","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.047197551196597631}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.570796326794896558}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 2.094395102393195492}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 3.141592653589793115}"}],"query":"project cos=cos([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"cos","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":1}]},{"items":[{"type":{"scalar":"f64"},"f64":0.5}]},{"items":[{"type":{"scalar":"f64"},"f64":0}]},{"items":[{"type":{"scalar":"f64"},"f64":-0.5}]},{"items":[{"type":{"scalar":"f64"},"f64":-1}]}]}}},{"name":"cos(x), return cosine of numeric literal \'x\'","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project cos=cos(3.141592653589793115997963)","output":{"freeForm":{"type":{"columns":[{"name":"cos","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":-1}]}]}}}]}',
) as ScalarFuncType;

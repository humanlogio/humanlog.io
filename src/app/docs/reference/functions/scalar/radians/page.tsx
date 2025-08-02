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
  '{"name":"radians","implemented":true,"desc":"Converts an angle measurement from degrees to radians. The formula used is radians = degrees × π/180. Accepts numeric input (f64 or i64) and returns an f64 result.","usage":"Converts angle measurements from degrees to radians.","category":"math","signatures":[{"return_type":"f64","arg_types":["f64"]},{"return_type":"f64","arg_types":["i64"]}],"examples":[{"name":"radians(x), convert \'x\' degrees to radians","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project radians=radians(90)","output":{"freeForm":{"type":{"columns":[{"name":"radians","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":1.5707963267948966}]}]}}},{"name":"radians(x), convert \'x\' degrees to radians","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 90}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 180}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 270}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 360}"}],"query":"project radians=radians([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"radians","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":1.5707963267948966}]},{"items":[{"type":{"scalar":"f64"},"f64":3.141592653589793}]},{"items":[{"type":{"scalar":"f64"},"f64":4.71238898038469}]},{"items":[{"type":{"scalar":"f64"},"f64":6.283185307179586}]}]}}}]}',
) as ScalarFuncType;

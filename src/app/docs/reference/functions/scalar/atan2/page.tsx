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
  '{"name":"atan2","implemented":true,"desc":"Computes the angle in radians between the positive x-axis and the ray from the origin to the point (y, x), considering the signs of both inputs to determine the correct quadrant. Takes two arguments (y, x) that can be either f64 or i64, and returns an f64 result in radians between -π and π.","usage":"Calculates the angle between the positive x-axis and the point (y, x).","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64","scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:f64","scalar:i64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64","scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64","scalar:i64"]}],"examples":[{"name":"atan2(y, x), returns angle between the positive x-axis and the point (y, x) in radians","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0, \\"y\\": 0.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0, \\"y\\": 1.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.0, \\"y\\": 0.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.0, \\"y\\": 1.0}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.5, \\"y\\": 0.5}"}],"query":"project atan2=atan2([\'y\'], [\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"atan2","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":0}]},{"items":[{"type":{"scalar":"f64"},"f64":1.5707963267948966}]},{"items":[{"type":{"scalar":"f64"},"f64":0}]},{"items":[{"type":{"scalar":"f64"},"f64":0.7853981633974483}]},{"items":[{"type":{"scalar":"f64"},"f64":0.7853981633974483}]}]}}},{"name":"atan2(y, x), returns angle between the positive x-axis and the point (y, x) in radians","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project atan2=atan2(1, 1)","output":{"freeForm":{"type":{"columns":[{"name":"atan2","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":0.7853981633974483}]}]}}}]}',
) as ScalarFuncType;

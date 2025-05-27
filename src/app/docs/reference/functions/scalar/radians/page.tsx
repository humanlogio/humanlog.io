/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse(
  '{"name":"radians","implemented":true,"desc":"Converts an angle measurement from degrees to radians. The formula used is radians = degrees × π/180. Accepts numeric input (f64 or i64) and returns an f64 result.","usage":"Converts angle measurements from degrees to radians.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"radians(x), convert \'x\' degrees to radians","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project radians=radians(90)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"radians","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":1.5707963267948966}}]}]}}}}}},{"name":"radians(x), convert \'x\' degrees to radians","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 90}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 180}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 270}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 360}"}],"query":"project radians=radians([\'x\'])","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"radians","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":1.5707963267948966}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":3.141592653589793}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":4.71238898038469}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":6.283185307179586}}]}]}}}}}}]}',
) as ScalarFuncType;

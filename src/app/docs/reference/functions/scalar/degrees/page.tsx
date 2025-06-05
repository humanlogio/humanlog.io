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
  '{"name":"degrees","implemented":true,"desc":"Converts an angle measurement from radians to degrees. The formula used is degrees = radians × 180/π. Accepts numeric input (f64 or i64) and returns an f64 result.","usage":"Converts angle measurements from radians to degrees.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"degrees(x), convert \'x\' radians to degrees","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project degrees=degrees(1.570796326794896558)","output":{"tabular":{"freeForm":{"type":{"columns":[{"name":"degrees","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":90}]}]}}}},{"name":"degrees(x), converts \'x\' radians to degrees","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.570796326794896558}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 3.141592653589793116}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 4.712388980384689674}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 6.283185307179586232}"}],"query":"project degrees=degrees([\'x\'])","output":{"tabular":{"freeForm":{"type":{"columns":[{"name":"degrees","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":90}]},{"items":[{"type":{"scalar":"f64"},"f64":180}]},{"items":[{"type":{"scalar":"f64"},"f64":270}]},{"items":[{"type":{"scalar":"f64"},"f64":360}]}]}}}}]}',
) as ScalarFuncType;

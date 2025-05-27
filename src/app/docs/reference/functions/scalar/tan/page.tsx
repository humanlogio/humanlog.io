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
  '{"name":"tan","implemented":true,"desc":"Computes the tangent of the input angle (specified in radians). Accepts numeric input (f64 or i64) and returns an f64 result. The tangent function returns NaN at angles like π/2 + nπ (where n is an integer).","usage":"Calculates the tangent of an angle specified in radians.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"tan(x), return tangent of \'x\' referenced from the log data","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.785398163397448278999491}"}],"query":"project tan=tan([\'x\'])","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"tan","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":0}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":1}}]}]}}}}}},{"name":"tan(x), return tangent of numeric literal \'x\'","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project tan=tan(0.785398163397448278999491)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"tan","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":1}}]}]}}}}}}]}',
) as ScalarFuncType;

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
  '{"name":"sqrt","implemented":true,"desc":"Calculates the square root of the input value. Requires a non-negative input value (f64 or i64) and returns an f64 result. Returns NaN if the input is negative.","usage":"Returns the square root of a non-negative number.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"sqrt(x), return square root of \'x\' referenced from the log data","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 4}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 9}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 16}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 25}"},{"machineId":1,"sessionId":1,"eventId":5,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 36}"}],"query":"project sqrt=sqrt([\'x\'])","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"sqrt","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":2}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":3}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":4}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":5}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":6}}]}]}}}}}},{"name":"sqrt(x), return square root of numeric literal \'x\'","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project sqrt=sqrt(16.0)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"sqrt","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":4}}]}]}}}}}}]}',
) as ScalarFuncType;

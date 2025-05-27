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
  '{"name":"sign","implemented":true,"desc":"Determines the sign of the input numeric value. Returns -1 for negative values, 0 for zero, and 1 for positive values. Accepts f64 or i64 input and returns an i64 result.","usage":"Returns the sign of a number: -1, 0, or 1.","category":"math","signatures":[{"return_type":"scalar:i64","arg_types":["scalar:f64"]},{"return_type":"scalar:i64","arg_types":["scalar:i64"]}],"examples":[{"name":"sign(x), return sign of \'x\' referenced from the log data","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": -1.234}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 0.0}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 1.234}"}],"query":"project sign=sign([\'x\'])","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"sign","type":{"Type":{"Scalar":3}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":3}},"Kind":{"I64":-1}}]},{"items":[{"type":{"Type":{"Scalar":3}},"Kind":{"I64":0}}]},{"items":[{"type":{"Type":{"Scalar":3}},"Kind":{"I64":1}}]}]}}}}}},{"name":"sign(x), return sign of numeric literal \'x\'","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project sign=sign(1.234)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"sign","type":{"Type":{"Scalar":3}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":3}},"Kind":{"I64":1}}]}]}}}}}}]}',
) as ScalarFuncType;

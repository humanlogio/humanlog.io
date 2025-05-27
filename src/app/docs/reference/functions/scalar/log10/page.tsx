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
  '{"name":"log10","implemented":true,"desc":"Computes the base-10 logarithm of the input value. Requires a positive non-zero numeric input (f64 or i64) and returns an f64 result. Returns an error if the input is zero or negative.","usage":"Calculates the base-10 logarithm of a positive number.","category":"math","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]}],"examples":[{"name":"log10, common(base-10) logarithm of numeric literal value","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\"}"}],"query":"project log10=log10(1000000)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"log10","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":6}}]}]}}}}}},{"name":"log10(x), common(base-10) logarithm of \'x\' referenced from the log data","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\", \\"pow_of_ten\\": 10}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\", \\"pow_of_ten\\": 100}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\", \\"pow_of_ten\\": 1000}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\", \\"pow_of_ten\\": 10000}"},{"machineId":1,"sessionId":1,"eventId":5,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\", \\"pow_of_ten\\": 100000}"}],"query":"project log10=log10(pow_of_ten)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"log10","type":{"Type":{"Scalar":2}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":1}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":2}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":3}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":4}}]},{"items":[{"type":{"Type":{"Scalar":2}},"Kind":{"F64":5}}]}]}}}}}}]}',
) as ScalarFuncType;

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
  '{"name":"dcountif","implemented":true,"desc":"Calculates the number of distinct values for the specified expression within each group, only counting rows where the condition is true. Takes an expression to count distinct values of and a boolean condition. Null values are treated as false, and the result is returned as an i64 integer.","usage":"Counts the distinct values where a condition is true.","category":"counting","signatures":[{"return_type":"scalar:i64","arg_types":["scalar:str","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:f64","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:i64","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:bool","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:ts","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:dur","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:blob","scalar:bool"]}],"examples":[{"name":"summarize dcount if value lt","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\",\\"source\\":{\\"line\\": 1}}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\",\\"source\\":{\\"line\\": 2}}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log4\\"}"},{"machineId":1,"sessionId":1,"eventId":5,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log5\\",\\"source\\":{\\"line\\": 3}}"},{"machineId":1,"sessionId":1,"eventId":6,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log6\\",\\"source\\":{\\"line\\": 4}}"},{"machineId":1,"sessionId":1,"eventId":7,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log7\\",\\"source\\":{\\"line\\": 5}}"}],"query":"summarize dcountif([\'source.line\'], [\'source.line\'] > 3)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"dcountif","type":{"Type":{"Scalar":3}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":3}},"Kind":{"I64":2}}]}]}}}}}}]}',
) as ScalarFuncType;

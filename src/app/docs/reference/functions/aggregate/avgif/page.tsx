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
  '{"name":"avgif","implemented":true,"desc":"Computes the arithmetic mean of the specified numeric expression across rows in each group where the boolean condition evaluates to true. Accepts numeric (f64, i64) or duration values and a boolean condition. Null values are treated as false, and returns the corresponding average value.","usage":"Calculates the average of values where a condition is true.","category":"statistical","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64","scalar:bool"]},{"return_type":"scalar:f64","arg_types":["scalar:i64","scalar:bool"]},{"return_type":"scalar:dur","arg_types":["scalar:dur","scalar:bool"]}],"examples":[{"name":"summarize average if value gt","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\",\\"source\\":{\\"line\\": 1}}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\",\\"source\\":{\\"line\\": 2}}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log4\\"}"},{"machineId":1,"sessionId":1,"eventId":5,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log5\\",\\"source\\":{\\"line\\": 3}}"},{"machineId":1,"sessionId":1,"eventId":6,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log6\\",\\"source\\":{\\"line\\": 4}}"},{"machineId":1,"sessionId":1,"eventId":7,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log7\\",\\"source\\":{\\"line\\": 5}}"}],"query":"summarize avgif([\'source.line\'], [\'source.line\'] >= 3)","output":{"tabular":{"freeForm":{"type":{"columns":[{"name":"avgif","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":4}]}]}}}}]}',
) as ScalarFuncType;

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
  '{"name":"percentileif","implemented":true,"desc":"Computes the specified percentile value of the expression across rows in each group where the boolean condition evaluates to true. Takes three arguments: the expression to compute the percentile for, an integer percentile value between 0 and 100, and a boolean condition. Null values are treated as false.","usage":"Calculates the specified percentile of values where a condition is true.","category":"statistical","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64","scalar:i64","scalar:bool"]},{"return_type":"scalar:i64","arg_types":["scalar:i64","scalar:i64","scalar:bool"]},{"return_type":"scalar:dur","arg_types":["scalar:dur","scalar:i64","scalar:bool"]}],"examples":[{"name":"summarize percentile if value lt","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\",\\"source\\":{\\"line\\": 1}}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"machineId":1,"sessionId":1,"eventId":3,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\",\\"source\\":{\\"line\\": 2}}"},{"machineId":1,"sessionId":1,"eventId":4,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log4\\"}"},{"machineId":1,"sessionId":1,"eventId":5,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log5\\",\\"source\\":{\\"line\\": 3}}"},{"machineId":1,"sessionId":1,"eventId":6,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log6\\",\\"source\\":{\\"line\\": 4}}"},{"machineId":1,"sessionId":1,"eventId":7,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log7\\",\\"source\\":{\\"line\\": 5}}"}],"query":"summarize percentileif([\'source.line\'], 50, [\'source.line\'] > 2)","output":{"tabular":{"freeForm":{"type":{"columns":[{"name":"percentileif","type":{"scalar":"i64"}}]},"rows":[{"items":[{"type":{"scalar":"i64"},"i64":"4"}]}]}}}}]}',
) as ScalarFuncType;

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
  '{"name":"varianceif","implemented":true,"desc":"Computes the variance (a measure of dispersion) of the specified expression across rows in each group where the boolean condition evaluates to true. Accepts numeric (f64, i64) or duration inputs and a boolean condition. Null values are treated as false.","usage":"Calculates the variance of values where a condition is true.","category":"statistical","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64","scalar:bool"]},{"return_type":"scalar:f64","arg_types":["scalar:i64","scalar:bool"]},{"return_type":"scalar:dur","arg_types":["scalar:dur","scalar:bool"]}],"examples":[{"name":"summarize variance if value lt","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\",\\"source\\":{\\"line\\": 1}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\",\\"source\\":{\\"line\\": 2}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log4\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log5\\",\\"source\\":{\\"line\\": 3}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log6\\",\\"source\\":{\\"line\\": 4}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log7\\",\\"source\\":{\\"line\\": 5}}"}],"query":"summarize varianceif([\'source.line\'], [\'source.line\'] > 3)","output":{"freeForm":{"type":{"columns":[{"name":"varianceif","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":0.25}]}]}}}]}',
) as ScalarFuncType;

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
  '{"name":"stddev","implemented":true,"desc":"Computes the standard deviation (square root of variance) of the specified expression across all rows in each group. Accepts numeric (f64, i64) or duration inputs and returns an f64 result for numeric inputs or a duration for duration inputs.","usage":"Calculates the standard deviation of values within each group.","category":"statistical","signatures":[{"return_type":"scalar:f64","arg_types":["scalar:f64"]},{"return_type":"scalar:f64","arg_types":["scalar:i64"]},{"return_type":"scalar:dur","arg_types":["scalar:dur"]}],"examples":[{"name":"summarize stddev","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\",\\"source\\":{\\"line\\": 1}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\",\\"source\\":{\\"line\\": 2}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log4\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log5\\",\\"source\\":{\\"line\\": 3}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log6\\",\\"source\\":{\\"line\\": 4}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.003\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log7\\",\\"source\\":{\\"line\\": 5}}"}],"query":"summarize stddev([\'source.line\'])","output":{"freeForm":{"type":{"columns":[{"name":"stddev","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":1.4142135623730951}]}]}}}]}',
) as ScalarFuncType;

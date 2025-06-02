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
  '{"name":"make_timestamp","implemented":true,"desc":"Creates a timestamp from a given date and time. Takes the following arguments: year, month, day, hour, minute, second as i64, and sub-seconds as a f64.","usage":"Creates a timestamp from a given date and time.","category":"time","signatures":[{"return_type":"scalar:ts","arg_types":["scalar:i64","scalar:i64","scalar:i64","scalar:i64","scalar:i64","scalar:i64","scalar:f64"]}],"examples":[{"name":"make a timestamp from year, month, day, hour, minute, second, subsecond","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project ts=make_timestamp(2006, 1, 2, 15, 4, 6, 0.001)","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"ts","type":{"Type":{"Scalar":5}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":5}},"Kind":{"Ts":{"seconds":1136214246,"nanos":1000000}}}]}]}}}}}},{"name":"make a timestamp from year, month, day, hour, minute, second, subsecond","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"year\\": 2006, \\"month\\": 1, \\"day\\": 2, \\"hour\\": 15, \\"minute\\": 4, \\"second\\": 6, \\"subsecond\\": 0.001}"},{"machineId":1,"sessionId":1,"eventId":2,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"year\\": 2007, \\"month\\": 1, \\"day\\": 2, \\"hour\\": 15, \\"minute\\": 4, \\"second\\": 6, \\"subsecond\\": 0.001}"}],"query":"project ts=make_timestamp([\'year\'], [\'month\'], [\'day\'], [\'hour\'], [\'minute\'], [\'second\'], [\'subsecond\'])","output":{"Shape":{"Tabular":{"Shape":{"FreeForm":{"type":{"columns":[{"name":"ts","type":{"Type":{"Scalar":5}}}]},"rows":[{"items":[{"type":{"Type":{"Scalar":5}},"Kind":{"Ts":{"seconds":1136214246,"nanos":1000000}}}]},{"items":[{"type":{"Type":{"Scalar":5}},"Kind":{"Ts":{"seconds":1167750246,"nanos":1000000}}}]}]}}}}}}]}',
) as ScalarFuncType;

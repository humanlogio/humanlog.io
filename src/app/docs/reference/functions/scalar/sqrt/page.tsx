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
  '{"name":"sqrt","implemented":true,"desc":"Calculates the square root of the input value. Requires a non-negative input value (f64 or i64) and returns an f64 result. Returns NaN if the input is negative.","usage":"Returns the square root of a non-negative number.","category":"math","signatures":[{"return_type":"f64","arg_types":["f64"]},{"return_type":"f64","arg_types":["i64"]}],"examples":[{"name":"sqrt(x), return square root of \'x\' referenced from the log data","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 4}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 9}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 16}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 25}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 36}"}],"query":"project sqrt=sqrt([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"sqrt","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":2}]},{"items":[{"type":{"scalar":"f64"},"f64":3}]},{"items":[{"type":{"scalar":"f64"},"f64":4}]},{"items":[{"type":{"scalar":"f64"},"f64":5}]},{"items":[{"type":{"scalar":"f64"},"f64":6}]}]}}},{"name":"sqrt(x), return square root of numeric literal \'x\'","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project sqrt=sqrt(16.0)","output":{"freeForm":{"type":{"columns":[{"name":"sqrt","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":4}]}]}}}]}',
) as ScalarFuncType;

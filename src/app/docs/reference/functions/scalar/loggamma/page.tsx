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
  '{"name":"loggamma","implemented":true,"desc":"Computes the natural logarithm of the absolute value of the gamma function for the input value. Useful for preventing overflow when computing the gamma function for large inputs. Accepts numeric input (f64 or i64) and returns an f64 result.","usage":"Calculates the natural logarithm of the absolute value of the gamma function.","category":"math","signatures":[{"return_type":"f64","arg_types":["f64"]},{"return_type":"f64","arg_types":["i64"]}],"examples":[{"name":"loggamma(x), return loggamma of numeric literal \'x\'","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"msg\\":\\"example\\"}"}],"query":"project loggamma=loggamma(100)","output":{"freeForm":{"type":{"columns":[{"name":"loggamma","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":359.13420536957545}]}]}}},{"name":"loggamma(x), return loggamma of \'x\' referenced from the log data","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\", \\"x\\": 100}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project loggamma=loggamma([\'x\'])","output":{"freeForm":{"type":{"columns":[{"name":"loggamma","type":{"scalar":"f64"}}]},"rows":[{"items":[{"type":{"scalar":"f64"},"f64":359.13420536957545}]},{"items":[{"type":{"null":{}},"null":{}}]},{"items":[{"type":{"null":{}},"null":{}}]},{"items":[{"type":{"null":{}},"null":{}}]},{"items":[{"type":{"null":{}},"null":{}}]}]}}}]}',
) as ScalarFuncType;

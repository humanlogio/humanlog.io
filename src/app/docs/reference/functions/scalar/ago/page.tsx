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
  '{"name":"ago","implemented":true,"desc":"Subtracts the given timespan from the current UTC clock time.","usage":"Subtracts the given timespan from the current UTC clock time.","category":"time","signatures":[{"return_type":"scalar:ts","arg_types":["scalar:dur"]}],"examples":[{"name":"ago(x), get timestamp of now() - \'x\'","input":[{"machineId":1,"sessionId":1,"eventId":1,"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"info\\"}"}],"query":"project ts=ago(1h)","output":{"tabular":{"freeForm":{"type":{"columns":[{"name":"ts","type":{"scalar":"ts"}}]},"rows":[{"items":[{"type":{"scalar":"ts"},"ts":"2025-03-10T19:55:20Z"}]}]}}}}]}',
) as ScalarFuncType;

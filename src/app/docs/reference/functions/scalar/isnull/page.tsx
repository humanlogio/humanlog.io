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
  '{"name":"isnull","implemented":true,"desc":"Determines whether the provided value is NULL. Returns true only if the value is NULL","usage":"Tests whether a value is NULL.","category":"validation","signatures":[{"return_type":"bool","arg_types":["null"]},{"return_type":"bool","arg_types":["[unknown]"]},{"return_type":"bool","arg_types":["blob"]},{"return_type":"bool","arg_types":["bool"]},{"return_type":"bool","arg_types":["duration"]},{"return_type":"bool","arg_types":["f64"]},{"return_type":"bool","arg_types":["i64"]},{"return_type":"bool","arg_types":["string"]},{"return_type":"bool","arg_types":["timestamp"]}],"examples":[{"name":"isnull(x), return true if \'x\' is NULL","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\", \\"source\\": {\\"func\\":\\"hello\\"}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\", \\"source\\": {\\"func\\":\\"Blablablb\\"}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\", \\"source\\": {\\"func\\":\\"blablablB\\"}}"}],"query":"filter isnull([\'source.func\'])","output":{"logs":{"logs":[{"ulid":"2","observedTimestamp":"2006-01-02T15:04:06.001Z","raw":"eyJ0cyI6IjIwMDYtMDEtMDJUMTU6MDQ6MDYuMDAyIiwgImx2bCI6ICJlcnJvciIsICJtc2ciOiJsb2cyIn0=","timestamp":"2006-01-02T15:04:06.002Z","severityText":"error","serviceName":"antoine\'s service","body":"log2","resource":{"resourceHash64":"11207385833379704810","schemaUrl":"res_schema_url","attributes":[{"key":"service.name","value":{"type":{"scalar":"str"},"str":"antoine\'s service"}}]},"scope":{"scopeHash64":"18087277630167445714","schemaUrl":"scope_schema_url","name":"test-scope","version":"v0.0.0-test","attributes":[{"key":"component","value":{"type":{"scalar":"str"},"str":"database"}}]}}]}}}]}',
) as ScalarFuncType;

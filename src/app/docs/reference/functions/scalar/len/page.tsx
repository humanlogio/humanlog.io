/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}
  
const func: ScalarFuncType = JSON.parse("{\"name\":\"len\",\"implemented\":true,\"desc\":\"Calculates and returns the length (number of characters in a string or elements in an array) as an i64 integer value. Accepts either a string or array argument and returns an error if applied to other data types.\",\"usage\":\"Returns the length of a string or array as an integer.\",\"category\":\"utility\",\"signatures\":[{\"return_type\":\"scalar:i64\",\"arg_types\":[\"scalar:str\"]},{\"return_type\":\"scalar:i64\",\"arg_types\":[\"array:{items:{scalar:unknown}}\"]}],\"examples\":[{\"name\":\"string length\",\"input\":[{\"machineId\":1,\"sessionId\":1,\"eventId\":1,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.001\\\", \\\"lvl\\\": \\\"error\\\", \\\"msg\\\":\\\"log1\\\", \\\"source\\\": {\\\"func\\\":\\\"hello\\\"}}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":2,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.002\\\", \\\"lvl\\\": \\\"error\\\", \\\"msg\\\":\\\"log2\\\"}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":3,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.002\\\", \\\"lvl\\\": \\\"error\\\", \\\"msg\\\":\\\"log3\\\", \\\"source\\\": {\\\"func\\\":\\\"Blablablb\\\"}}\"},{\"machineId\":1,\"sessionId\":1,\"eventId\":4,\"parsedAt\":\"2006-01-02T15:04:06.001Z\",\"log\":\"{\\\"ts\\\":\\\"2006-01-02T15:04:06.002\\\", \\\"lvl\\\": \\\"error\\\", \\\"msg\\\":\\\"log3\\\", \\\"source\\\": {\\\"func\\\":\\\"blablablB\\\"}}\"}],\"query\":\"project func_name_length=len(['source.func'])\",\"output\":{\"Shape\":{\"Tabular\":{\"Shape\":{\"FreeForm\":{\"type\":{\"columns\":[{\"name\":\"func_name_length\",\"type\":{\"Type\":{\"Scalar\":3}}}]},\"rows\":[{\"items\":[{\"type\":{\"Type\":{\"Scalar\":3}},\"Kind\":{\"I64\":5}}]},{\"items\":[{\"type\":{\"Type\":{\"Null\":null}},\"Kind\":{\"Null\":null}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":3}},\"Kind\":{\"I64\":9}}]},{\"items\":[{\"type\":{\"Type\":{\"Scalar\":3}},\"Kind\":{\"I64\":9}}]}]}}}}}}]}") as ScalarFuncType;

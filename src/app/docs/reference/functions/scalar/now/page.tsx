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
  '{"name":"now","implemented":true,"desc":"Returns a timestamp representing the current system time in UTC format. This function takes no arguments and always returns the current time when evaluated.","usage":"Returns the current time as a timestamp in UTC.","category":"datetime","signatures":[{"return_type":"scalar:ts"}],"examples":[{"name":"now","input":[{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.001\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log1\\", \\"source\\": {\\"func\\":\\"hello\\"}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log2\\"}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\", \\"source\\": {\\"func\\":\\"Blablablb\\"}}"},{"parsedAt":"2006-01-02T15:04:06.001Z","log":"{\\"ts\\":\\"2006-01-02T15:04:06.002\\", \\"lvl\\": \\"error\\", \\"msg\\":\\"log3\\", \\"source\\": {\\"func\\":\\"blablablB\\"}}"}],"query":"project current_time=now()","output":{"freeForm":{"type":{"columns":[{"name":"current_time","type":{"scalar":"ts"}}]},"rows":[{"items":[{"type":{"scalar":"ts"},"ts":"2025-03-10T20:55:20Z"}]},{"items":[{"type":{"scalar":"ts"},"ts":"2025-03-10T20:55:20Z"}]},{"items":[{"type":{"scalar":"ts"},"ts":"2025-03-10T20:55:20Z"}]},{"items":[{"type":{"scalar":"ts"},"ts":"2025-03-10T20:55:20Z"}]}]}}}]}',
) as ScalarFuncType;

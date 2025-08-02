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
  '{"name":"toblob","implemented":false,"desc":"convert the given string to a blob","usage":"convert the given string to a blob","category":"conversion","signatures":[{"return_type":"blob","arg_types":["string"]}],"examples":null}',
) as ScalarFuncType;

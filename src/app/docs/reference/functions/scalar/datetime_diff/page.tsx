/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse(
  '{"name":"datetime_diff","implemented":false,"desc":"Calculates calendarian difference between two datetime values.","usage":"Calculates calendarian difference between two datetime values.","category":"time","signatures":[{"return_type":"scalar:i64","arg_types":["scalar:str","scalar:ts","scalar:ts"]}],"examples":null}',
) as ScalarFuncType;

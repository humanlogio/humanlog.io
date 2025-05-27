/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export default function Page() {
  return <Func func={func} />;
}
  
const func: ScalarFuncType = JSON.parse("{\"name\":\"pi\",\"implemented\":false,\"desc\":\"Returns the mathematical constant π (pi) as a 64-bit floating-point value (approximately 3.14159265358979323846).\",\"usage\":\"Returns the mathematical constant π (pi).\",\"category\":\"math\",\"signatures\":[{\"return_type\":\"scalar:f64\"}],\"examples\":null}") as ScalarFuncType;

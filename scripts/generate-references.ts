import {
  AggregateFunc,
  Reference,
  ScalarFunc,
  ScalarOperator,
  Symbols,
  TabularOperator,
} from "@/types/docs";
import fs from "fs";
import path from "path";

const writeFileInDir = (filename: string, content: string) => {
  const dirname = path.dirname(filename);

  try {
    fs.mkdirSync(dirname, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
    // don't care if the directory already exists
  }
  fs.writeFileSync(filename, content);
};

const urlForScalarFunctionsIndex = () => {
  return `/docs/reference/functions/scalar`;
};

const urlForAggregateFunctionsIndex = () => {
  return `/docs/reference/functions/aggregate`;
};

const urlForScalarFunction = (func: ScalarFunc) => {
  return `/docs/reference/functions/scalar/${func.name}`;
};

const urlForAggregateFunction = (func: ScalarFunc) => {
  return `/docs/reference/functions/aggregate/${func.name}`;
};

const urlForScalarOperator = (operators: ScalarOperator[]) => {
  return `/docs/reference/operators/scalar`;
};

const urlForTabularOperator = (operators: TabularOperator[]) => {
  return `/docs/reference/operators/tabular`;
};

export const generateSymbolsReference = (ref: Reference) => {
  generateLogsReference(ref.symbols);
  generateSpansReference(ref.symbols);
};

export const generateReferenceDump = (ref: Reference) => {
  const refDump = JSON.stringify(JSON.stringify(ref));
  const filename = `src/lib/utils/reference.ts`;

  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Reference } from "@/types/docs";
export const reference: Reference = JSON.parse(${refDump}) as Reference;
`,
  );
};

export const generateLogsReference = (symbols: Symbols) => {
  const logsSymbols = JSON.stringify(JSON.stringify(symbols.logs));
  const urlPath = "/docs/reference/symbols/logs";
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Symbols } from "@/components/docs/reference/symbols/Symbols";
import { Symbol } from "@/types/docs";

export default function Page() {
  return <Symbols symbols={symbols} />;
}

const symbols: Symbol[] = JSON.parse(${logsSymbols}) as Symbol[];
`,
  );
};

export const generateSpansReference = (symbols: Symbols) => {
  const spansSymbols = JSON.stringify(JSON.stringify(symbols.spans));
  const urlPath = "/docs/reference/symbols/spans";
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Symbols } from "@/components/docs/reference/symbols/Symbols";
import { Symbol } from "@/types/docs";

export default function Page() {
  return <Symbols symbols={symbols} />;
}

const symbols: Symbol[] = JSON.parse(${spansSymbols}) as Symbol[];
`,
  );
};

export const generateScalarFunctionsIndex = (ref: Reference) => {
  const scalarFuncs = JSON.stringify(JSON.stringify(ref.funcs.scalar));
  const urlPath = urlForScalarFunctionsIndex();
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { ScalarFuncIndex } from "@/components/docs/reference/ScalarFuncIndex";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <ScalarFuncIndex funcs={funcs} />;
}

const funcs: ScalarFuncType[] = JSON.parse(${scalarFuncs}) as ScalarFuncType[];
`,
  );
};

export const generateAggregateFunctionIndex = (ref: Reference) => {
  const AggregateFunc = JSON.stringify(JSON.stringify(ref.funcs.aggregate));
  const urlPath = urlForAggregateFunctionsIndex();
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { ScalarFuncIndex } from "@/components/docs/reference/ScalarFuncIndex";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <ScalarFuncIndex funcs={funcs} />;
}

const funcs: ScalarFuncType[] = JSON.parse(${AggregateFunc}) as ScalarFuncType[];
`,
  );
};

export const generateScalarFunction = (func: ScalarFunc) => {
  const scalarFuncType = JSON.stringify(JSON.stringify(func));
  const urlPath = urlForScalarFunction(func);
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse(${scalarFuncType}) as ScalarFuncType;
`,
  );
};

export const generateAggregateFunction = (func: AggregateFunc) => {
  const scalarFuncType = JSON.stringify(JSON.stringify(func));
  const urlPath = urlForAggregateFunction(func);
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Func } from "@/components/docs/reference/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "@/types/docs";

export default function Page() {
  return <Func func={func} />;
}

const func: ScalarFuncType = JSON.parse(${scalarFuncType}) as ScalarFuncType;
`,
  );
};

export const generateScalarOperator = (operators: ScalarOperator[]) => {
  const operatorType = JSON.stringify(JSON.stringify(operators));
  const urlPath = urlForScalarOperator(operators);
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Operators } from "@/components/docs/reference/operators/Operators";
import { ScalarOperator } from "@/types/docs";

export default function Page() {
  return <Operators operators={operators} />;
}

const operators: ScalarOperator[] = JSON.parse(${operatorType}) as ScalarOperator[];
`,
  );
};

export const generateTabularOperator = (operators: TabularOperator[]) => {
  const operatorType = JSON.stringify(JSON.stringify(operators));
  const urlPath = urlForTabularOperator(operators);
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { Operators } from "@/components/docs/reference/operators/Operators";
import { TabularOperator } from "@/types/docs";

export default function Page() {
  return <Operators operators={operators} />;
}

const operators: TabularOperator[] = JSON.parse(${operatorType}) as TabularOperator[];
`,
  );
};

export const generateReferences = () => {
  const refFile = fs.readFileSync("humanlogql-reference.json", "utf8");
  const reference = JSON.parse(refFile);

  const ref = reference as Reference;

  // Generate symbols references
  generateSymbolsReference(ref);

  // Generate functions references
  generateScalarFunctionsIndex(ref);
  generateAggregateFunctionIndex(ref);
  ref.funcs.scalar.forEach(generateScalarFunction);
  ref.funcs.aggregate.forEach(generateAggregateFunction);

  // Generate operators references
  if (ref.operators) {
    generateScalarOperator(ref.operators.scalar);
    generateTabularOperator(ref.operators.tabular);
  }
};

generateReferences();

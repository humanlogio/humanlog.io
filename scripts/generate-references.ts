import fs from "fs";
import path from "path";

// Type definitions
export interface TypeInfo {
  type: string;
}

export interface Symbol extends TypeInfo {
  name: string;
  desc: string;
}

export interface Symbols {
  logs: Symbol[];
  spans: Symbol[];
}

export interface Signature {
  arg_types: string[];
  return_type: string;
}

// Add interfaces for different scalar type values
interface ScalarValue {
  Type: {
    Scalar: number;
  };
}

interface NullValue {
  Type: {
    Null: null;
  };
}

interface MapValue {
  Type: {
    Map: Record<string, unknown>;
  };
}

// Add interfaces for different kind values
interface F64Kind {
  Kind: {
    F64: number;
  };
}

interface I64Kind {
  Kind: {
    I64: number;
  };
}

interface StrKind {
  Kind: {
    Str: string;
  };
}

interface BoolKind {
  Kind: {
    Bool: boolean;
  };
}

interface NullKind {
  Kind: {
    Null: null;
  };
}

interface BlobKind {
  Kind: {
    Blob: string;
  };
}

interface TsKind {
  Kind: {
    Ts: {
      seconds: number;
      nanos: number;
    };
  };
}

interface MapKind {
  Kind: {
    Map: Record<string, unknown>;
  };
}

interface RowItem {
  type: ScalarValue | NullValue | MapValue;
  Kind:
    | F64Kind["Kind"]
    | I64Kind["Kind"]
    | StrKind["Kind"]
    | BoolKind["Kind"]
    | NullKind["Kind"]
    | BlobKind["Kind"]
    | TsKind["Kind"]
    | MapKind["Kind"];
}

interface Row {
  items: RowItem[];
}

interface FreeForm {
  type: {
    columns: {
      name: string;
      type: ScalarValue | NullValue;
    }[];
  };
  rows: Row[];
}

interface TabularShape {
  Shape: {
    FreeForm: FreeForm;
  };
}

interface LogEvents {
  events: any[];
}

interface LogEventsShape {
  Shape: {
    LogEvents: LogEvents;
  };
}

interface ExampleOutput {
  Shape: {
    Tabular: TabularShape | LogEventsShape;
  };
}

interface LogEntry {
  machineId: number;
  sessionId: number;
  eventId: number;
  parsedAt: string;
  log: string;
}

export interface Example {
  name: string;
  input: LogEntry[];
  query: string;
  output: ExampleOutput;
}

export interface ScalarFunc {
  name: string;
  desc: string;
  usage: string;
  category: string;
  implemented?: boolean;
  signatures: Signature[];
  examples: Example[];
}

export interface AggregateFunc {
  name: string;
  desc: string;
  usage: string;
  category: string;
  implemented?: boolean;
  signatures: Signature[];
  examples: Example[];
}

export interface ScalarOperator {
  name: string;
  desc: string;
  implemented?: boolean;
  examples: Example[];
}

export interface TabularOperator {
  name: string;
  desc: string;
  implemented?: boolean;
  usage?: string;
  syntax?: string[];
  examples: Example[];
}

export interface Funcs {
  scalar: ScalarFunc[];
  aggregate: AggregateFunc[];
}

export interface Operators {
  scalar: ScalarOperator[];
  tabular: TabularOperator[];
}

export interface Reference {
  symbols: Symbols;
  funcs: Funcs;
  operators: Operators;
}

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

// URL 생성 헬퍼 함수
const urlForScalarFunctionsIndex = () => {
  return `/docs/reference/functions/scalar`;
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

/**
 * Symbols 참조 문서 생성 함수
 */
export const generateSymbolsReference = (ref: Reference) => {
  generateLogsReference(ref.symbols);
  generateSpansReference(ref.symbols);
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

import { Symbols } from "@/components/docs/symbols/Symbols";
import { Symbol } from "scripts/generate-references";

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

import { Symbols } from "@/components/docs/symbols/Symbols";
import { Symbol } from "scripts/generate-references";

export default function Page() {
  return <Symbols symbols={symbols} />;
}
  
const symbols: Symbol[] = JSON.parse(${spansSymbols}) as Symbol[];
`,
  );
};

/**
 * Functions 참조 문서 생성 함수
 */
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

import { ScalarFuncIndex } from "@/components/docs/ScalarFuncIndex";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export default function Page() {
  return <ScalarFuncIndex funcs={funcs} />;
}
  
const funcs: ScalarFuncType[] = JSON.parse(${scalarFuncs}) as ScalarFuncType[];
`,
  );
};

export const generateAggregateFunctionIndex = (ref: Reference) => {
  const AggregateFunc = JSON.stringify(JSON.stringify(ref.funcs.aggregate));
  const urlPath = urlForScalarFunctionsIndex();
  const filename = `src/app${urlPath}/page.tsx`;
  writeFileInDir(
    filename,
    `/**
 * @generated
 * This file is auto-generated. Do not edit manually.
 */

import { ScalarFuncIndex } from "@/components/docs/ScalarFuncIndex";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

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

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

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

import { Func } from "@/components/docs/funcs/Func";
import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

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

import { Operators } from "@/components/docs/operators/Operators";
import { ScalarOperator } from "scripts/generate-references";

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

import { Operators } from "@/components/docs/operators/Operators";
import { TabularOperator } from "scripts/generate-references";

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

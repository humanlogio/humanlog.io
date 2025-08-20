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
export interface ScalarValue {
  Type: {
    Scalar: number;
  };
}

export interface NullValue {
  Type: {
    Null: null;
  };
}

export interface MapValue {
  Type: {
    Map: Record<string, unknown>;
  };
}

// Add interfaces for different kind values
export interface F64Kind {
  Kind: {
    F64: number;
  };
}

export interface I64Kind {
  Kind: {
    I64: number;
  };
}

export interface StrKind {
  Kind: {
    Str: string;
  };
}

export interface BoolKind {
  Kind: {
    Bool: boolean;
  };
}

export interface NullKind {
  Kind: {
    Null: null;
  };
}

export interface BlobKind {
  Kind: {
    Blob: string;
  };
}

export interface TsKind {
  Kind: {
    Ts: {
      seconds: number;
      nanos: number;
    };
  };
}

export interface MapKind {
  Kind: {
    Map: Record<string, unknown>;
  };
}

export interface RowItem {
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

export interface Row {
  items: RowItem[];
}

export interface FreeForm {
  type: {
    columns: {
      name: string;
      type: ScalarValue | NullValue;
    }[];
  };
  rows: Row[];
}

export interface TabularShape {
  Shape: {
    FreeForm: FreeForm;
  };
}

export interface LogEvents {
  events: any[];
}

export interface LogEventsShape {
  Shape: {
    LogEvents: LogEvents;
  };
}

export interface ExampleOutput {
  Shape: {
    Tabular: TabularShape | LogEventsShape;
  };
}

export interface LogEntry {
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

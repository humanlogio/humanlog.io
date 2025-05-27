"use client";

import { ScalarOperator, TabularOperator } from "scripts/generate-references";

interface OperatorsProps {
  operators: ScalarOperator[] | TabularOperator[];
}

export function Operators({ operators }: OperatorsProps) {
  return (
    <div>
      {operators.map((operator, i) => {
        return <Operator operator={operator} key={`${i}-${operator.name}`} />;
      })}
    </div>
  );
}

interface OperatorProps {
  operator: ScalarOperator | TabularOperator;
}

export function Operator({ operator }: OperatorProps) {
  const isTabular = "syntax" in operator;

  return (
    <>
      <h1>{operator.name}</h1>
      <p>{operator.desc}</p>

      {isTabular && (
        <>
          <h2>Usage</h2>
          <p>{(operator as TabularOperator).usage}</p>

          {(operator as TabularOperator).syntax && (
            <>
              <h2>Syntax</h2>
              <ul>
                {(operator as TabularOperator).syntax?.map((syn, index) => (
                  <li key={index}>
                    <code>{syn}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <h2>Examples</h2>
      {operator.examples?.map((example, index) => (
        <div key={index} className="mb-8">
          <h3>{example.name}</h3>
          <div className="mb-4">
            <h4>Query</h4>
            <pre className="rounded bg-gray-100 p-2">{example.query}</pre>
          </div>

          <div>
            <h4>Input</h4>
            <pre className="max-h-40 overflow-auto rounded bg-gray-100 p-2">
              {JSON.stringify(example.input, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </>
  );
}

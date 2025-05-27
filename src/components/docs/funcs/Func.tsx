"use client";

import { ScalarFunc as ScalarFuncType } from "scripts/generate-references";

export function Func({ func }: { func: ScalarFuncType }) {
  return (
    <>
      <h1>{func.name}</h1>
      <p>{func.desc}</p>
      <p>{func.usage}</p>
      <p>
        {func.examples.map((example, i) => (
          <p key={`${i}-${example.name}`}>{example.name}</p>
        ))}
      </p>
    </>
  );
}

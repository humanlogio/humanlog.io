"use client";

import { Symbol } from "@/types/docs";

export function Symbols({ symbols }: { symbols: Symbol[] }) {
  return (
    <div>
      {symbols.map((symbol, i) => {
        return (
          <div key={`${i}-${symbol.name}`}>
            <p>{symbol.type}</p>
            <p>{symbol.name}</p>
            <p>{symbol.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

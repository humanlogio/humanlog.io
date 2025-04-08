"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import * as jsxRuntime from "react/jsx-runtime";

export function MDXContent({ code }: { code: string }) {
  const MDXComponent = useMDXComponent(code, { _jsx_runtime: jsxRuntime });

  return <MDXComponent />;
}

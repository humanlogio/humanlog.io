"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import * as React from "react";

export function MDXContent({ code }: { code: string }) {
  const MDXComponent = useMDXComponent(code);

  // React.createElement를 사용하여 명시적으로 렌더링
  return React.createElement(MDXComponent);
}

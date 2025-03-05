"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";

export function MDXContent({ code }: { code: string }) {
  const MDXComponent = useMDXComponent(code);

  return <MDXComponent />;
}

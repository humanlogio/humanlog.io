import { ReactNode } from "react";
import config from "@/features/config";
import { notFound } from "next/navigation";

export default function EnvLayout({ children }: { children: ReactNode }) {
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  if (isProd) {
    notFound();
  }

  return <div>{children}</div>;
}

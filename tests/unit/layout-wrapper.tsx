import { ReactNode } from "react";
import Layout from "@/app/layout";

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  return <Layout>{children}</Layout>;
};

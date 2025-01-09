import { ReactNode } from "react";
import { render } from "@testing-library/react";
import Layout from "@/app/layout";

const TestWrapper = ({ children }: { children: ReactNode }) => {
  return <Layout>{children}</Layout>;
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
    ...options,
  });

export * from "@testing-library/react";
export { customRender as render };

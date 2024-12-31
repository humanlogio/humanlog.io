import { expect, test } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TestWrapper } from "./layout-wrapper";
import LogInterface from "@/components/env/log-interface";

test("im and testing something new", () => {
  render(
    <TestWrapper>
      <LogInterface />
    </TestWrapper>,
  );

  const link = within(screen.getAllByRole("link")[0]);
  expect(link.getByTitle("humanlog.io home link")).toBeDefined();
});

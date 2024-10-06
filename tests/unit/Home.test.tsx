import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "../../src/app/page";
import { TestWrapper } from "./layout-wrapper";

test("Pages Router", () => {
  render(
    <TestWrapper>
      <Home />
    </TestWrapper>,
  );
  const main = within(screen.getByRole("main"));
  expect(
    main.getByRole("heading", { level: 1, name: /welcome to next\.js!/i }),
  ).toBeDefined();

  const footer = within(screen.getByRole("contentinfo"));
  const link = within(footer.getByRole("link"));
  expect(link.getByRole("img", { name: /vercel logo/i })).toBeDefined();
});

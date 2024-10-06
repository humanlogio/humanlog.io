import { expect, test } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Home from "../../src/app/page";
import { TestWrapper } from "./layout-wrapper";

test("pages render", () => {
  render(
    <TestWrapper>
      <Home />
    </TestWrapper>,
  );

  const link = within(screen.getAllByRole("link")[0]);
  expect(link.getByTitle("humanlog.io home link")).toBeDefined();
});

test("account selector is interactable", () => {
  render(
    <TestWrapper>
      <Home />
    </TestWrapper>,
  );

  const main = within(screen.getAllByTitle("Account Selector")[0]);

  const selectTrigger = main.getByRole("combobox");
  expect(selectTrigger).toBeInTheDocument();
  expect(selectTrigger).toBeVisible();

  const localhostOptionBeforeClick = main.queryByRole("option", {
    name: /localhost/i,
  });
  expect(localhostOptionBeforeClick).not.toBeInTheDocument();

  fireEvent.click(selectTrigger);

  const localhostOption = screen.getByRole("option", { name: /localhost/i });
  expect(localhostOption).toBeVisible();
  expect(localhostOption).toHaveTextContent("localhost");
});

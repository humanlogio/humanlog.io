import { expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Home from "@/app/page";
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

  const main = within(screen.getAllByTitle("Environment Selector")[0]);

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

vi.mock("@/components/asciinemaPlayer", () => {
  return {
    default: () => <div data-testid="mock-asciinema-player">Mock Player</div>,
  };
});

vi.mock("asciinema-player", () => {
  return {
    default: () => <div data-testid="mock-asciinema-player-library">Mock Library Player</div>,
  };
});

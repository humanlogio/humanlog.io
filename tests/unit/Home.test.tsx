import { expect, test, vi } from "vitest";
import { fireEvent, screen, within, waitFor } from "@testing-library/react";
import { render } from "tests/setup/custom-render";
import Home from "@/app/page";

// Mock window object if needed
vi.mock("@/context/list-environments", () => ({
  useAllEnvironments: () => ({
    localhostInfo: null,
    localhostValid: false,
    checkLocalhost: vi.fn(),
    user: null,
    listEnvironments: [],
    activeEnvironment: null,
    currentOrg: null,
    defaultOrg: null,
    doLogin: vi.fn(),
  }),
}));

test("pages render", async () => {
  render(<Home />);

  await waitFor(() => {
    const link = within(screen.getAllByRole("link")[0]);
    expect(link.getByTitle("humanlog.io home link")).toBeDefined();
  });
});

test("account selector is interactable", async () => {
  render(<Home />);

  await waitFor(() => {
    const main = within(screen.getAllByTitle("Environment Selector")[0]);
    const selectTrigger = main.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toBeVisible();
  });

  const main = within(screen.getAllByTitle("Environment Selector")[0]);
  const selectTrigger = main.getByRole("combobox");

  const localhostOptionBeforeClick = main.queryByRole("option", {
    name: /localhost/i,
  });
  expect(localhostOptionBeforeClick).not.toBeInTheDocument();

  fireEvent.click(selectTrigger);

  await waitFor(() => {
    const localhostOption = screen.getByRole("option", { name: /localhost/i });
    expect(localhostOption).toBeVisible();
    expect(localhostOption).toHaveTextContent("localhost");
  });
});

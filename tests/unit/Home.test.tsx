import { expect, test } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { render } from "tests/setup/custom-render";
import Home from "@/app/page";

test("pages render", () => {
  render(<Home />);

  //   const link = within(screen.getAllByRole("link")[0]);
  //   expect(link.getByTitle("humanlog.io home link")).toBeDefined();
  // });

  // test("account selector is interactable", () => {
  //   render(<Home />);

  //   const main = within(screen.getAllByTitle("Environment Selector")[0]);

  //   const selectTrigger = main.getByRole("combobox");
  //   expect(selectTrigger).toBeInTheDocument();
  //   expect(selectTrigger).toBeVisible();

  //   const localhostOptionBeforeClick = main.queryByRole("option", {
  //     name: /localhost/i,
  //   });
  //   expect(localhostOptionBeforeClick).not.toBeInTheDocument();

  //   fireEvent.click(selectTrigger);

  //   const localhostOption = screen.getByRole("option", { name: /localhost/i });
  //   expect(localhostOption).toBeVisible();
  //   expect(localhostOption).toHaveTextContent("localhost");
});

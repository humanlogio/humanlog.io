import { test, expect } from "@playwright/test";

test("should navigate to the about page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Select source").click();
  await page.getByText("localhost unavailable :( -> install it?").click();
  await expect(page).toHaveURL("/install");
  await expect(page.locator("h1")).toContainText("About");
});

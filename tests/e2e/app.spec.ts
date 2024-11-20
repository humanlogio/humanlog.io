import { test, expect } from "@playwright/test";

test("should navigate to the install page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Select source").click();
  await page.getByText("unavailable :( -> install it?").click();
  await expect(page).toHaveURL("/install");
  await expect(page.locator("h1")).toContainText("Get Started");
});

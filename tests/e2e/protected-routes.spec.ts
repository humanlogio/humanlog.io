import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.beforeEach(async ({ page }) => {
  await page.route("**/svc.auth.v1.AuthService/GetAuthURL", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authUrl: "/login_test",
      }),
    });
  });

  await page.route("**/svc.user.v1.UserService/GetLogoutURL", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        logoutUrl: "/logout_test",
      }),
    });
  });

  await page.route("**/svc.user.v1.UserService/Whoami", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "1",
          email: "test@example.com",
          firstName: "Test_firstName",
          lastName: "User_lastName",
        },
        currentOrganization: {
          id: "1",
          name: "Test Org",
        },
        defaultOrganization: {
          id: "1",
          name: "Test Org",
        },
      }),
    });
  });
});

test("should redirect to login page with redirect query when not logged in", async ({
  page,
}) => {
  await page.route("**/svc.user.v1.UserService/Whoami", (route) => {
    route.fulfill({
      status: 300,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/env/new");
  await expect(page).toHaveURL("/login?redirect=%2Fenv%2Fnew");
  await expect(page.locator("text=Sign up").last()).toBeVisible();
  await expect(page.locator("text=You're logged in")).not.toBeVisible();
  await expect(page.locator("text=Loading login interface")).not.toBeVisible();
});

test("should not redirect when properly logged in", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "hlog_session",
      value: "fake_token",
      domain: "app.humanlog.dev",
      path: "/",
    },
  ]);

  await page.goto("/env/new");
  await expect(page).toHaveURL("/env/new");
  await expect(page.locator("text=Create a new environment")).toBeVisible();
  await expect(page.locator("text=Test_firstName")).toBeVisible();
  await expect(page.locator("text=Sign in")).not.toBeVisible();
});

test("should log out and redirect to login page", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "hlog_session",
      value: "fake_token",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/env/new");
  await page.click('div[aria-label="user-dropdown"]');
  await page.click('div[aria-label="logout"]');

  await page.route("**/svc.user.v1.UserService/Whoami", (route) => {
    route.fulfill({
      status: 300,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await expect(page).toHaveURL("/login?redirect=%2Fenv%2Fnew");
  await expect(page.locator("text=Sign up").last()).toBeVisible();
  await expect(page.locator("text=Loading login interface")).not.toBeVisible();
});

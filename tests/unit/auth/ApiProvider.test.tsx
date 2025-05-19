import { expect, test, beforeEach, vi, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { ApiClientsProvider, removeAuthToken } from "@/context/api-provider";

// Mock react-cookie
vi.mock("react-cookie", () => ({
  useCookies: () => {
    return [
      { hlog_session: "test-jwt-token" }, // Simulates having a token in cookies
      vi.fn(), // setCookie mock
      vi.fn(), // removeCookie mock
    ];
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock environment module
vi.mock("@/lib/envs", () => ({
  getAPIURL: () => "http://localhost:8080",
  getSelfURL: () => "http://localhost:3000",
}));

// Mock config
vi.mock("@/features/config", () => ({
  default: {
    NEXT_PUBLIC_IS_PROD: false,
    TLD: ".io",
  },
}));

// Mock transport
vi.mock("@connectrpc/connect-web", () => ({
  createConnectTransport: () => ({}),
}));

// Mock connect client
vi.mock("@connectrpc/connect", () => ({
  createClient: () => ({}),
  ConnectError: class MockConnectError extends Error {
    code = "";
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
  Code: {
    Unauthenticated: "unauthenticated",
  },
}));

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("ApiClientsProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test(
    "should copy token from cookies to localStorage on mount",
    async () => {
      // This test checks if the API Provider properly initializes
      // localStorage from cookies on mount

      // Verify localStorage is empty before the test
      expect(window.localStorage.getItem("hlog_session")).toBeNull();

      // Create a spy on the console.log function to detect our specific log message
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      // Render the provider component which should trigger the useEffect
      render(
        <ApiClientsProvider>
          <div>Test Component</div>
        </ApiClientsProvider>,
      );

      // Wait for any async operations to complete - with a short timeout
      await waitFor(() => {
        // With the fix applied, localStorage should now have the token from cookies
        expect(window.localStorage.getItem("hlog_session")).toBe(
          "test-jwt-token",
        );
      });
      // Also verify our specific log message was called - this message only exists in our fix
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Initializing auth token from cookie",
      );
    },
    { timeout: 1000 },
  ); // 1 second timeout
});

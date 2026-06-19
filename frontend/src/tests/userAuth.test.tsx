import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  AuthProvider,
  useAuth,
  SignedIn,
  SignedOut,
} from "../context/AuthContext";
import React from "react";

// mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const TestComponent = () => {
  const { user, login, logout, isSignedIn } = useAuth();
  return (
    <div>
      <div data-testid="is-signed-in">{String(isSignedIn)}</div>
      <div data-testid="user-id">{user ? user.id : "none"}</div>
      <button
        onClick={() =>
          login("mock-token", {
            id: "user1",
            name: "User 1",
            email: "user@example.com",
          })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe("User Auth Context", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("provides auth state correctly", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Default state
    await waitFor(() => {
      expect(screen.getByTestId("is-signed-in").textContent).toBe("false");
    });

    // Login
    screen.getByText("Login").click();
    await waitFor(() => {
      expect(screen.getByTestId("is-signed-in").textContent).toBe("true");
      expect(screen.getByTestId("user-id").textContent).toBe("user1");
      expect(window.localStorage.getItem("token")).toBe("mock-token");
    });

    // Logout
    screen.getByText("Logout").click();
    await waitFor(() => {
      expect(screen.getByTestId("is-signed-in").textContent).toBe("false");
      expect(screen.getByTestId("user-id").textContent).toBe("none");
      expect(window.localStorage.getItem("token")).toBeNull();
    });
  });

  it("SignedIn / SignedOut components work", async () => {
    render(
      <AuthProvider>
        <SignedIn>
          <div data-testid="signed-in-content">Signed In Only</div>
        </SignedIn>
        <SignedOut>
          <div data-testid="signed-out-content">Signed Out Only</div>
        </SignedOut>
        <TestComponent />
      </AuthProvider>,
    );

    // Initially SignedOut
    await waitFor(() => {
      expect(screen.getByTestId("signed-out-content")).toBeDefined();
      expect(screen.queryByTestId("signed-in-content")).toBeNull();
    });

    // Login
    screen.getByText("Login").click();

    // Now SignedIn
    await waitFor(() => {
      expect(screen.getByTestId("signed-in-content")).toBeDefined();
      expect(screen.queryByTestId("signed-out-content")).toBeNull();
    });
  });
});

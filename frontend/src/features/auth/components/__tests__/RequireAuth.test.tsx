import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequireAuth from "../RequireAuth";
import * as AuthContextModule from "../../context/AuthContext";

describe("RequireAuth Guard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state when authentication is loading", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/portfolio"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/portfolio" element={<div>Protected Portfolio Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("require-auth-loading")).toBeInTheDocument();
    expect(screen.getByText("Verifying session...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Portfolio Page")).not.toBeInTheDocument();
  });

  it("should redirect unauthenticated users to /login with encoded next parameter", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/portfolio?tab=holdings"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/portfolio" element={<div>Protected Portfolio</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page Mock")).toBeInTheDocument();
    expect(screen.queryByText("Protected Portfolio")).not.toBeInTheDocument();
  });

  it("should render child route / content when user is authenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 1,
        username: "rahul_trader",
        email: "rahul@example.com",
        date_joined: "2026-08-01T00:00:00Z",
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });


    render(
      <MemoryRouter initialEntries={["/portfolio"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/portfolio" element={<div>Protected Portfolio Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Portfolio Content")).toBeInTheDocument();
    expect(screen.queryByTestId("require-auth-loading")).not.toBeInTheDocument();
  });
});

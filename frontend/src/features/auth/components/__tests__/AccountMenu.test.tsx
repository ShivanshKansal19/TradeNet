import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountMenu from "../AccountMenu";
import * as AuthContextModule from "../../context/AuthContext";


const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AccountMenu Component", () => {
  const mockLogout = vi.fn();
  const mockUpdateProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render 'Sign In' link when user is unauthenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshProfile: vi.fn(),
      updateProfile: mockUpdateProfile,
    });

    render(
      <MemoryRouter>
        <AccountMenu variant="header" />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  it("should render user initials and username when authenticated", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 1,
        username: "johndoe",
        email: "john@example.com",
        first_name: "John",
        last_name: "Doe",
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshProfile: vi.fn(),
      updateProfile: mockUpdateProfile,
    });

    render(
      <MemoryRouter>
        <AccountMenu variant="header" />
      </MemoryRouter>
    );

    expect(screen.getByText("JO")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
  });

  it("should toggle popover menu and render navigation items when clicked", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 1,
        username: "johndoe",
        email: "john@example.com",
        first_name: "John",
        last_name: "Doe",
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshProfile: vi.fn(),
      updateProfile: mockUpdateProfile,
    });

    render(
      <MemoryRouter>
        <AccountMenu variant="sidebar" />
      </MemoryRouter>
    );

    // Initial state: menu is closed
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    // Click trigger button
    const trigger = screen.getByRole("button", { name: /user account menu/i });
    fireEvent.click(trigger);

    // Menu open
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /my profile/i })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: /portfolios/i })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("menuitem", { name: /watchlists/i })).toHaveAttribute("href", "/watchlist");
    expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
  });

  it("should invoke logout and navigate to /login when Log Out is clicked", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: 1,
        username: "johndoe",
        email: "john@example.com",
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      refreshProfile: vi.fn(),
      updateProfile: mockUpdateProfile,
    });

    render(
      <MemoryRouter>
        <AccountMenu variant="header" />
      </MemoryRouter>
    );

    const trigger = screen.getByRole("button", { name: /user account menu/i });
    fireEvent.click(trigger);

    const logoutButton = screen.getByRole("menuitem", { name: /log out/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

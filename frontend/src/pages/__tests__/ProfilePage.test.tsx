import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../ProfilePage";
import * as AuthContextModule from "../../features/auth/context/AuthContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProfilePage Component", () => {
  const mockLogout = vi.fn();
  const mockUpdateProfile = vi.fn();

  const dummyUser = {
    id: 1,
    username: "protrader",
    email: "protrader@example.com",
    first_name: "Pro",
    last_name: "Trader",
    date_joined: "2026-01-15T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render user profile details properly", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: dummyUser,
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
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Pro Trader")).toBeInTheDocument();
    expect(screen.getByText("@protrader")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Trader")).toBeInTheDocument();
    expect(screen.getByDisplayValue("protrader@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("protrader")).toBeDisabled();
  });

  it("should update profile successfully on valid submission", async () => {
    mockUpdateProfile.mockResolvedValueOnce({
      ...dummyUser,
      first_name: "Master",
      last_name: "Chief",
      email: "chief@example.com",
    });

    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: dummyUser,
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
        <ProfilePage />
      </MemoryRouter>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(firstNameInput, { target: { value: "Master" } });
    fireEvent.change(lastNameInput, { target: { value: "Chief" } });
    fireEvent.change(emailInput, { target: { value: "chief@example.com" } });

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        first_name: "Master",
        last_name: "Chief",
        email: "chief@example.com",
      });
    });

    expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
  });

  it("should validate invalid email format before submission", async () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: dummyUser,
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
        <ProfilePage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitBtn);

    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  it("should handle backend error responses cleanly", async () => {
    mockUpdateProfile.mockRejectedValueOnce({
      response: {
        data: {
          email: ["Enter a valid email address."],
        },
      },
    });

    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: dummyUser,
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
        <ProfilePage />
      </MemoryRouter>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "NewName" } });

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("email: Enter a valid email address.")).toBeInTheDocument();
    });
  });

  it("should trigger logout and navigate to /login when Sign Out is clicked", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: dummyUser,
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
        <ProfilePage />
      </MemoryRouter>
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

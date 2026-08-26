import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ScreenerPage from "../ScreenerPage";
import * as screenerModule from "../../features/screener";
import * as authModule from "../../features/auth";
import { portfolioService } from "../../features/portfolios";

vi.mock("../../features/screener", async () => {
  const actual = await vi.importActual("../../features/screener");
  return {
    ...actual,
    fetchScreenerStocks: vi.fn(),
  };
});

describe("ScreenerPage", () => {
  const mockStocks = [
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      sector: "Technology",
      price: 3850.00,
      change: 45.00,
      change_percent: 1.18,
      market_cap: 1400000,
      pe_ratio: 29.5,
      rsi: 58.2,
      forecast_5d_pct: 2.1,
      forecast_prob: 64,
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd",
      sector: "Technology",
      price: 1650.00,
      change: -12.00,
      change_percent: -0.72,
      market_cap: 680000,
      pe_ratio: 24.1,
      rsi: 48.0,
      forecast_5d_pct: 1.4,
      forecast_prob: 58,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(screenerModule.fetchScreenerStocks).mockResolvedValue(mockStocks);
  });

  it("renders screener table with stock items and quick actions", async () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ScreenerPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("TCS")).toBeInTheDocument();
    expect(screen.getByTestId("screener-add-portfolio-TCS")).toBeInTheDocument();
    expect(screen.getByTestId("screener-add-watchlist-TCS")).toBeInTheDocument();
  });

  it("intercepts unauthenticated guest clicking 'Add to Portfolio' in screener table", async () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ScreenerPage />
      </MemoryRouter>
    );

    const addBtn = await screen.findByTestId("screener-add-portfolio-TCS");
    fireEvent.click(addBtn);

    expect(screen.getByTestId("auth-prompt-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign In to Manage Portfolios")).toBeInTheDocument();
    expect(screen.getByText(/add TCS to your portfolio/i)).toBeInTheDocument();
  });

  it("intercepts unauthenticated guest clicking 'Add to Watchlist' in screener table", async () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ScreenerPage />
      </MemoryRouter>
    );

    const watchlistBtn = await screen.findByTestId("screener-add-watchlist-TCS");
    fireEvent.click(watchlistBtn);

    expect(screen.getByTestId("auth-prompt-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign In to Save Watchlist")).toBeInTheDocument();
    expect(screen.getByText(/save TCS to your personal watchlist/i)).toBeInTheDocument();
  });

  it("opens AddHoldingModal for authenticated user clicking 'Add to Portfolio' on screener row", async () => {
    vi.spyOn(authModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, username: "trader", email: "trader@test.com" } as any,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue([
      { id: 1, name: "Core Equity", holdings_count: 5, created_at: "", updated_at: "" },
    ]);

    render(
      <MemoryRouter>
        <ScreenerPage />
      </MemoryRouter>
    );

    const addBtn = await screen.findByTestId("screener-add-portfolio-TCS");
    fireEvent.click(addBtn);

    expect(screen.getByTestId("add-holding-modal")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-prompt-modal")).not.toBeInTheDocument();
  });
});

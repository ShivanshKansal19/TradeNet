import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import * as authContextModule from "../features/auth/context/AuthContext";
import { portfolioService } from "../features/portfolios";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("App Routing - Portfolio deep linking and redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, username: "trader", email: "trader@example.com" } as any,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
      updateProfile: vi.fn(),
    });

    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue([
      {
        id: 1,
        name: "Main Portfolio",
        description: "Primary equities",
        holdings_count: 0,
        created_at: "",
        updated_at: "",
      },
    ]);

    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue({
      portfolio_id: 1,
      portfolio_name: "Main Portfolio",
      total_invested: 10000,
      total_current_value: 12000,
      total_pnl: 2000,
      total_return_percent: 20,
      holdings_count: 0,
      sector_allocations: [],
      holdings: [],
    });
  });

  it("should stay on Portfolio page when navigating to /portfolio/:portfolioId instead of forwarding to Dashboard", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/portfolio/1"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Portfolio Tracker")).toBeInTheDocument();
    });
    expect(screen.queryByText("Market Overview")).not.toBeInTheDocument();
  });

  it("should navigate to default portfolio when accessing /portfolio without redirecting to Dashboard", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/portfolio"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Portfolio Tracker")).toBeInTheDocument();
    });
    expect(screen.queryByText("Market Overview")).not.toBeInTheDocument();
  });
});


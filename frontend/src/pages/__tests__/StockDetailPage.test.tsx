import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StockDetailPage from "../StockDetailPage";
import * as stocksModule from "../../features/stocks";
import * as authModule from "../../features/auth";
import { portfolioService } from "../../features/portfolios";

// Mock child modules
vi.mock("../../features/stocks", async () => {
  const actual = await vi.importActual("../../features/stocks");
  return {
    ...actual,
    useStockDetails: vi.fn(),
    useStockTechnicals: vi.fn(),
  };
});

vi.mock("../../features/forecasts", () => ({
  ForecastCard: () => <div data-testid="forecast-card-stub">Forecast Card Stub</div>,
}));

vi.mock("../../components/charts/InteractiveStockChart", () => ({
  default: () => <div data-testid="stock-chart-stub">Stock Chart Stub</div>,
}));

describe("StockDetailPage", () => {
  const mockStock = {
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    price: 2950.00,
    change: 15.00,
    change_percent: 0.51,
    year_low: 2200.00,
    year_high: 3100.00,
    sector: "Energy",
    market_cap: 2000000,
    pe_ratio: 28.5,
    pb_ratio: 2.4,
    eps: 103.5,
    roe: 0.095,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stocksModule.useStockDetails).mockReturnValue({
      data: mockStock as any,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(stocksModule.useStockTechnicals).mockReturnValue({
      data: { rsi_14: 62.5, macd: 12.4, signal: 10.2 } as any,
      isLoading: false,
      error: null,
    } as any);
  });

  it("renders stock header with Add to Portfolio and Watchlist actions", () => {
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
      <MemoryRouter initialEntries={["/stocks/RELIANCE"]}>
        <Routes>
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("RELIANCE")).toBeInTheDocument();
    expect(screen.getByTestId("stock-detail-add-to-portfolio-btn")).toBeInTheDocument();
    expect(screen.getByTestId("stock-detail-add-to-watchlist-btn")).toBeInTheDocument();
  });

  it("intercepts guest clicking 'Add to Portfolio' with AuthPromptModal", async () => {
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
      <MemoryRouter initialEntries={["/stocks/RELIANCE"]}>
        <Routes>
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const addPortfolioBtn = screen.getByTestId("stock-detail-add-to-portfolio-btn");
    fireEvent.click(addPortfolioBtn);

    expect(screen.getByTestId("auth-prompt-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign In to Manage Portfolios")).toBeInTheDocument();
  });

  it("intercepts guest clicking 'Watchlist' with AuthPromptModal", async () => {
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
      <MemoryRouter initialEntries={["/stocks/RELIANCE"]}>
        <Routes>
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const watchlistBtn = screen.getByTestId("stock-detail-add-to-watchlist-btn");
    fireEvent.click(watchlistBtn);

    expect(screen.getByTestId("auth-prompt-modal")).toBeInTheDocument();
    expect(screen.getByText("Sign In to Save Watchlist")).toBeInTheDocument();
  });

  it("opens AddHoldingModal for authenticated user clicking 'Add to Portfolio'", async () => {
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
      { id: 10, name: "Alpha Fund", holdings_count: 2, created_at: "", updated_at: "" },
    ]);

    render(
      <MemoryRouter initialEntries={["/stocks/RELIANCE"]}>
        <Routes>
          <Route path="/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const addPortfolioBtn = screen.getByTestId("stock-detail-add-to-portfolio-btn");
    fireEvent.click(addPortfolioBtn);

    expect(screen.getByTestId("add-holding-modal")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-prompt-modal")).not.toBeInTheDocument();
  });
});

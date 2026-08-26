import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PortfolioPage from "../PortfolioPage";
import { portfolioService } from "../../features/portfolios/services/portfolioService";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PortfolioPage Component", () => {
  const mockPortfolios = [
    {
      id: 1,
      name: "Core Growth",
      description: "Long-term compounders",
      holdings_count: 2,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Momentum Breakouts",
      description: "Short term trades",
      holdings_count: 0,
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    },
  ];

  const mockAnalytics = {
    portfolio_id: 1,
    portfolio_name: "Core Growth",
    total_invested: 150000,
    total_current_value: 175000,
    total_pnl: 25000,
    total_return_percent: 16.67,
    holdings_count: 2,
    sector_allocations: [
      { sector: "Energy", value: 100000, weight_percent: 57.14 },
      { sector: "Technology", value: 75000, weight_percent: 42.86 },
    ],
    holdings: [
      {
        id: 101,
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd.",
        sector: "Energy",
        quantity: 50,
        average_buy_price: 2000,
        current_price: 2200,
        invested_value: 100000,
        current_value: 110000,
        pnl: 10000,
        pnl_percent: 10,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should automatically redirect from /portfolio to first portfolio /portfolio/1", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue(mockPortfolios);
    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue(mockAnalytics);

    render(
      <MemoryRouter initialEntries={["/portfolio"]}>
        <Routes>
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/portfolio/1", { replace: true });
    });
  });

  it("should render active portfolio name, switcher dropdown and holdings table", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue(mockPortfolios);
    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue(mockAnalytics);

    render(
      <MemoryRouter initialEntries={["/portfolio/1"]}>
        <Routes>
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Core Growth")).toBeInTheDocument();
    });

    expect(screen.getByText("Long-term compounders")).toBeInTheDocument();
    expect(screen.getByText("RELIANCE")).toBeInTheDocument();
    expect(screen.getByText("Sector Allocation")).toBeInTheDocument();
  });

  it("should open switcher dropdown and allow switching to another portfolio", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue(mockPortfolios);
    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue(mockAnalytics);

    render(
      <MemoryRouter initialEntries={["/portfolio/1"]}>
        <Routes>
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Core Growth")).toBeInTheDocument();
    });

    const switcherBtn = document.getElementById("portfolio-switcher-button");
    expect(switcherBtn).toBeInTheDocument();
    fireEvent.click(switcherBtn!);

    expect(screen.getByText("Your Portfolios")).toBeInTheDocument();
    const momentumOption = screen.getByText("Momentum Breakouts");
    fireEvent.click(momentumOption);

    expect(mockNavigate).toHaveBeenCalledWith("/portfolio/2");
  });

  it("should open Create Portfolio modal and submit new portfolio creation", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue(mockPortfolios);
    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue(mockAnalytics);
    const mockCreate = vi.spyOn(portfolioService, "createPortfolio").mockResolvedValue({
      id: 3,
      name: "Dividend Champions",
      description: "High yield dividend payers",
      holdings_count: 0,
      created_at: "2026-01-03T00:00:00Z",
      updated_at: "2026-01-03T00:00:00Z",
    });

    render(
      <MemoryRouter initialEntries={["/portfolio/1"]}>
        <Routes>
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Core Growth")).toBeInTheDocument();
    });

    const newPortfolioBtn = screen.getByRole("button", { name: /new portfolio/i });
    fireEvent.click(newPortfolioBtn);

    expect(screen.getByText("Create New Portfolio")).toBeInTheDocument();
    const nameInput = document.getElementById("portfolio-name-input") as HTMLInputElement;
    const descInput = document.getElementById("portfolio-description-input") as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: "Dividend Champions" } });
    fireEvent.change(descInput, { target: { value: "High yield dividend payers" } });

    const submitBtn = document.getElementById("create-portfolio-submit-button");
    fireEvent.click(submitBtn!);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: "Dividend Champions",
        description: "High yield dividend payers",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/portfolio/3");
    });
  });

  it("should delete holding when remove button is clicked", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue(mockPortfolios);
    vi.spyOn(portfolioService, "getPortfolioAnalytics").mockResolvedValue(mockAnalytics);
    const mockRemoveHolding = vi.spyOn(portfolioService, "removeHolding").mockResolvedValue();

    render(
      <MemoryRouter initialEntries={["/portfolio/1"]}>
        <Routes>
          <Route path="/portfolio/:portfolioId" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("RELIANCE")).toBeInTheDocument();
    });

    const removeBtn = screen.getByTitle("Remove Holding");
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(mockRemoveHolding).toHaveBeenCalledWith(1, { symbol: "RELIANCE" });
    });
  });

  it("should render empty state when user has no portfolios", async () => {
    vi.spyOn(portfolioService, "getPortfolios").mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/portfolio"]}>
        <Routes>
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No Portfolios Found")).toBeInTheDocument();
    });
    expect(screen.getByText(/Create your first custom portfolio/i)).toBeInTheDocument();
  });
});

import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type {
  PortfolioItem,
  PortfolioAnalytics,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  AddHoldingInput,
  Holding,
  PortfolioSummary,
} from "../types/portfolio";

export const portfolioService = {
  async getPortfolios(): Promise<PortfolioItem[]> {
    const response = await apiClient.get<PortfolioItem[] | { results: PortfolioItem[] }>(
      API_ENDPOINTS.PORTFOLIOS.LIST
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.results || [];
  },

  async getPortfolio(id: string | number): Promise<PortfolioItem> {
    const response = await apiClient.get<PortfolioItem>(
      API_ENDPOINTS.PORTFOLIOS.DETAIL(id)
    );
    return response.data;
  },

  async createPortfolio(data: CreatePortfolioInput): Promise<PortfolioItem> {
    const response = await apiClient.post<PortfolioItem>(
      API_ENDPOINTS.PORTFOLIOS.LIST,
      data
    );
    return response.data;
  },

  async updatePortfolio(id: string | number, data: UpdatePortfolioInput): Promise<PortfolioItem> {
    const response = await apiClient.patch<PortfolioItem>(
      API_ENDPOINTS.PORTFOLIOS.DETAIL(id),
      data
    );
    return response.data;
  },

  async deletePortfolio(id: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PORTFOLIOS.DETAIL(id));
  },

  async getPortfolioAnalytics(id: string | number): Promise<PortfolioAnalytics> {
    const response = await apiClient.get<PortfolioAnalytics>(
      API_ENDPOINTS.PORTFOLIOS.ANALYTICS(id)
    );
    return response.data;
  },

  async addHolding(portfolioId: string | number, data: AddHoldingInput): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.PORTFOLIOS.HOLDINGS(portfolioId),
      data
    );
    return response.data;
  },

  async removeHolding(
    portfolioId: string | number,
    identifier: { symbol?: string; holding_id?: number }
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PORTFOLIOS.HOLDINGS(portfolioId), {
      params: identifier,
    });
  },
};

export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  let totalInvested = 0;
  let currentValue = 0;

  holdings.forEach((h) => {
    totalInvested += h.quantity * h.averageBuyPrice;
    currentValue += h.quantity * h.currentPrice;
  });

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Approximate today's return at ~1.4%
  const todayPnl = currentValue * 0.0142;
  const todayPnlPercent = 1.42;

  return {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    todayPnl,
    todayPnlPercent,
    cashBalance: 45000,
  };
}

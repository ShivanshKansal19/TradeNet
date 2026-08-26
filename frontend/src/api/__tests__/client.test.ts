import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import apiClient, { refreshClient } from "../client";
import { authStorage } from "../../features/auth/services/authService";

describe("API Client Interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Request Interceptor", () => {
    it("should add Authorization header when access token is present in storage", async () => {
      authStorage.setTokens({
        access: "test-access-token-123",
        refresh: "test-refresh-token-456",
      });

      const requestHandler = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
      expect(requestHandler).toBeDefined();

      const config: any = { headers: {} };
      const modifiedConfig = await requestHandler(config);

      expect(modifiedConfig.headers.Authorization).toBe("Bearer test-access-token-123");
    });

    it("should not add Authorization header when no access token exists", async () => {
      const requestHandler = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
      expect(requestHandler).toBeDefined();

      const config: any = { headers: {} };
      const modifiedConfig = await requestHandler(config);

      expect(modifiedConfig.headers.Authorization).toBeUndefined();
    });

    it("should preserve existing Authorization header if already set", async () => {
      authStorage.setTokens({
        access: "storage-token",
        refresh: "storage-refresh",
      });

      const requestHandler = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
      const config: any = {
        headers: {
          Authorization: "Bearer custom-token",
        },
      };
      const modifiedConfig = await requestHandler(config);

      expect(modifiedConfig.headers.Authorization).toBe("Bearer custom-token");
    });
  });

  describe("Response Interceptor - 401 & Silent Refresh", () => {
    it("should handle session expiration when 401 occurs and no refresh token is present", async () => {
      const errorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;
      expect(errorHandler).toBeDefined();

      const mockError: any = {
        response: { status: 401 },
        config: { url: "/api/v1/portfolios/", headers: {} },
      };

      authStorage.setTokens({
        access: "old-token",
        refresh: "",
      });
      localStorage.removeItem("tradenet_refresh_token");

      await expect(errorHandler(mockError)).rejects.toBeDefined();
      expect(authStorage.getAccessToken()).toBeNull();
    });

    it("should silently refresh token and retry original request when 401 occurs with valid refresh token", async () => {
      const errorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;

      authStorage.setTokens({
        access: "expired-access-token",
        refresh: "valid-refresh-token",
      });

      // Mock refreshClient.post
      const refreshSpy = vi.spyOn(refreshClient, "post").mockResolvedValueOnce({
        data: { access: "new-fresh-access-token", refresh: "valid-refresh-token" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      });

      // Mock adapter on original request to avoid actual XHR network call
      const originalRequest: any = {
        url: "/api/v1/portfolios/",
        headers: { Authorization: "Bearer expired-access-token" },
        adapter: vi.fn().mockResolvedValue({
          data: { id: 1, name: "Main Portfolio" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        }),
      };

      const mockError: any = {
        response: { status: 401 },
        config: originalRequest,
      };

      const response = await errorHandler(mockError);

      expect(refreshSpy).toHaveBeenCalledWith("/api/v1/auth/token/refresh/", {
        refresh: "valid-refresh-token",
      });
      expect(authStorage.getAccessToken()).toBe("new-fresh-access-token");
      expect(originalRequest.headers.Authorization).toBe("Bearer new-fresh-access-token");
      expect(response.data).toEqual({ id: 1, name: "Main Portfolio" });
    });

    it("should clear tokens and dispatch session expired event when refresh request fails", async () => {
      const errorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;

      authStorage.setTokens({
        access: "expired-access-token",
        refresh: "invalid-refresh-token",
      });

      vi.spyOn(refreshClient, "post").mockRejectedValueOnce(new Error("Token is invalid or expired"));

      const originalRequest: any = {
        url: "/api/v1/portfolios/",
        headers: {},
      };

      const mockError: any = {
        response: { status: 401 },
        config: originalRequest,
      };

      let sessionExpiredFired = false;
      window.addEventListener("tradenet:auth:session-expired", () => {
        sessionExpiredFired = true;
      });

      await expect(errorHandler(mockError)).rejects.toThrow("Token is invalid or expired");
      expect(authStorage.getAccessToken()).toBeNull();
      expect(authStorage.getRefreshToken()).toBeNull();
      expect(sessionExpiredFired).toBe(true);
    });

    it("should queue multiple concurrent 401 requests and retry them all after single refresh", async () => {
      const errorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;

      authStorage.setTokens({
        access: "expired-access-token",
        refresh: "valid-refresh-token",
      });

      let refreshResolve: any;
      const refreshPromise = new Promise<{ data: { access: string; refresh: string } }>((res) => {
        refreshResolve = res;
      });

      const refreshSpy = vi.spyOn(refreshClient, "post").mockReturnValueOnce(refreshPromise as any);

      const originalRequest1: any = {
        url: "/api/v1/portfolios/",
        headers: { Authorization: "Bearer expired-access-token" },
        adapter: vi.fn().mockResolvedValue({
          data: { id: 1, name: "Portfolio 1" },
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        }),
      };

      const originalRequest2: any = {
        url: "/api/v1/watchlists/",
        headers: { Authorization: "Bearer expired-access-token" },
        adapter: vi.fn().mockResolvedValue({
          data: [{ id: 10, name: "Tech Watchlist" }],
          status: 200,
          statusText: "OK",
          headers: {},
          config: {} as any,
        }),
      };

      const mockError1: any = {
        response: { status: 401 },
        config: originalRequest1,
      };
      const mockError2: any = {
        response: { status: 401 },
        config: originalRequest2,
      };

      // Start first failing request (triggers refresh)
      const p1 = errorHandler(mockError1);
      // Second failing request arrives while refreshing is true
      const p2 = errorHandler(mockError2);

      // Resolve refresh
      refreshResolve({
        data: { access: "new-access-token-999", refresh: "valid-refresh-token" },
      });

      const [res1, res2] = await Promise.all([p1, p2]);

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(res1.data).toEqual({ id: 1, name: "Portfolio 1" });
      expect(res2.data).toEqual([{ id: 10, name: "Tech Watchlist" }]);
      expect(originalRequest1.headers.Authorization).toBe("Bearer new-access-token-999");
      expect(originalRequest2.headers.Authorization).toBe("Bearer new-access-token-999");
    });

    it("should not attempt token refresh for login endpoint 401s", async () => {
      const errorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;

      const refreshSpy = vi.spyOn(refreshClient, "post");

      const mockError: any = {
        response: { status: 401 },
        config: { url: "/api/v1/auth/login/", headers: {} },
      };

      await expect(errorHandler(mockError)).rejects.toEqual(mockError);
      expect(refreshSpy).not.toHaveBeenCalled();
    });
  });
});

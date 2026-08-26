import apiClient from "../../../api/client";
import type {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
  User,
} from "../types/auth";

const ACCESS_TOKEN_KEY = "tradenet_access_token";
const REFRESH_TOKEN_KEY = "tradenet_refresh_token";

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  },
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/login/", credentials);
    authStorage.setTokens({
      access: response.data.access,
      refresh: response.data.refresh,
    });
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/register/", credentials);
    authStorage.setTokens({
      access: response.data.access,
      refresh: response.data.refresh,
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/api/v1/auth/profile/");
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<User>("/api/v1/auth/profile/", data);
    return response.data;
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await apiClient.post<{ access: string }>("/api/v1/auth/token/refresh/", { refresh });
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
    return response.data;
  },

  logout(): void {
    authStorage.clearTokens();
  },
};


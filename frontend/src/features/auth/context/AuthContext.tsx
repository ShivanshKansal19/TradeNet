import { createContext, useContext, useEffect, useState, useCallback, type ReactNode, type FC } from "react";
import type { User, LoginCredentials, RegisterCredentials } from "../types/auth";
import { authService, authStorage } from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      authStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    const handleSessionExpiredEvent = () => {
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener("tradenet:auth:session-expired", handleSessionExpiredEvent);
    return () => {
      window.removeEventListener("tradenet:auth:session-expired", handleSessionExpiredEvent);
    };
  }, [refreshProfile]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.register(credentials);
      if (res.user) {
        setUser(res.user);
      } else {
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

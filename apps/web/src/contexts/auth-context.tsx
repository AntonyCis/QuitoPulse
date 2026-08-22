import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const payload = parseJwt(accessToken);
      if (payload && (payload.exp as number) * 1000 > Date.now()) {
        setUser({
          id: payload.sub as string,
          email: payload.email as string,
          role: payload.role as string,
        });
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuth = useCallback((data: AuthTokens & { user: User }) => {
    apiClient.post('/auth/login', undefined); // trigger token storage via apiClient
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.post<AuthTokens & { user: User }>('/auth/login', {
      email,
      password,
    });
    handleAuth(data);
  }, [handleAuth]);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const data = await apiClient.post<AuthTokens & { user: User }>('/auth/register', {
      email,
      password,
      displayName,
    });
    handleAuth(data);
  }, [handleAuth]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
    } finally {
      apiClient.clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

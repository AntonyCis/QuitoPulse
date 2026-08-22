import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, setTokens, clearTokens, getAccessToken } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const parts = token.split('.');
        const base64 = parts[1];
        if (!base64) { clearTokens(); return; }
        const payload = JSON.parse(atob(base64));
        setUser({
          id: String(payload.sub ?? ''),
          email: String(payload.email ?? ''),
          role: String(payload.role ?? 'USER'),
        });
      } catch {
        clearTokens();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'MODERATOR',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

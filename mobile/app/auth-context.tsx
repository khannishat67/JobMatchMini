import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { saveToken, getToken, deleteToken } from '../util/secure-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
type AuthContextType = {
  user: any;
  accessToken: string | null;
  login: (userData: any, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const refreshTimeout = useRef<any>(null);

  // Load tokens from Secure Storage on mount
  useEffect(() => {
    (async () => {
      const access = await getToken('accessToken');
      const refresh = await getToken('refreshToken');
      setAccessToken(access);
      setRefreshToken(refresh);
      // Optionally, fetch user info if access token exists
      if (access) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
    })();
    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, []);

  // Auto-refresh access token every 4 minutes
  useEffect(() => {
    if (!refreshToken) return;
    const scheduleRefresh = () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(refreshAccessToken, 4 * 60 * 1000); // 4 min
    };
    const refreshAccessToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.access);
          await saveToken('accessToken', data.access);
          scheduleRefresh();
        } else {
          await handleLogout();
        }
      } catch {
        await handleLogout();
      }
    };
    scheduleRefresh();
    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const login = async (userData: any, access: string, refresh: string) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);
    await saveToken('accessToken', access);
    await saveToken('refreshToken', refresh);
  };

  const handleLogout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    await deleteToken('accessToken');
    await deleteToken('refreshToken');
  };

  const logout = handleLogout;

  // Utility to always get a valid access token (refresh if needed)
  const getValidAccessToken = async () => {
    let access = await getToken('accessToken');
    if (!access && refreshToken) {
      // Try to refresh
      try {
        const res = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.access);
          await saveToken('accessToken', data.access);
          access = data.access;
        } else {
          await handleLogout();
          return null;
        }
      } catch {
        await handleLogout();
        return null;
      }
    }
    return access;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, getValidAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

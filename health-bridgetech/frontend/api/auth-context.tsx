import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setToken } from './client.js';
import type { User } from './types.js';

type AuthState = {
  user: User | null;
  loading: boolean;
  needsParentConsent: boolean;
  needsAssessment: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<{ needsParentConsent: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
};

export type SignupInput = {
  email: string;
  password: string;
  fullName: string;
  displayName?: string;
  dateOfBirth: string;
};

const AuthContext = createContext<AuthState | null>(null);

/** Provides the current authenticated user and auth actions */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const data = await api<{ token: string; user: User; needsParentConsent: boolean }>(
      '/api/auth/signup',
      {
        method: 'POST',
        auth: false,
        body: JSON.stringify(input),
      },
    );
    setToken(data.token);
    setUser(data.user);
    return { needsParentConsent: data.needsParentConsent };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Mock Google profile — in production this comes from the Google Identity SDK.
    const mockProfile = {
      email: 'demo.google@bridgetech.io',
      fullName: 'Google Demo User',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    };
    const data = await api<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(mockProfile),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const needsParentConsent = !!user?.isMinor && !user?.parentConsent?.verifiedAt;
  const needsAssessment =
    !!user && !needsParentConsent && (!user.problemAreas || user.problemAreas.length === 0);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      needsParentConsent,
      needsAssessment,
      login,
      signup,
      loginWithGoogle,
      logout,
      refresh,
      setUser,
    }),
    [user, loading, needsParentConsent, needsAssessment, login, signup, loginWithGoogle, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook for accessing the auth context */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

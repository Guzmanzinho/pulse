import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado optimista: usamos o user em cache (localStorage) para evitar flicker de auth.
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const [bootstrapping, setBootstrapping] = useState(true);

  // Bootstrap em background: valida o token contra /api/auth/perfil e ajusta o estado.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await authApi.getCurrentUser();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setBootstrapping(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authApi.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const u = await authApi.register(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const u = await authApi.getCurrentUser();
    setUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    bootstrapping,
    login, register, logout, refresh, setUser,
  }), [user, bootstrapping, login, register, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

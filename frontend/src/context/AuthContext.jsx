import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, usersApi } from '../api';
import { getToken, onUnauthorized, setToken } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'foodRescueUser';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Without a token the stored user is not a real sign-in (for example left over from an older version).
    return raw && getToken() ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// The backend returns a signed token at login. The token is sent with every request and is
// what the server checks. The stored user only decides which screens the UI shows; the
// server enforces the permissions.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const saveUser = useCallback((next) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.login(email, password);
      setToken(result.token);
      saveUser(result.user);
      return result.user;
    },
    [saveUser]
  );

  const register = useCallback(
    async (data) => {
      await usersApi.create(data);
      return login(data.email, data.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    setToken(null);
    saveUser(null);
  }, [saveUser]);

  // If the server rejects the token (expired, or the account was suspended), sign out.
  useEffect(() => {
    onUnauthorized(() => saveUser(null));
  }, [saveUser]);

  const userId = user?.id;
  // Re-reads the user from the server, e.g. after an admin approves a recipient org.
  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      saveUser(await usersApi.getById(userId));
    } catch {
      /* keep the stored copy if the refresh fails */
    }
  }, [userId, saveUser]);

  const value = useMemo(
    () => ({ user, login, register, logout, refreshUser }),
    [user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

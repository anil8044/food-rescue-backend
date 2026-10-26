import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi, usersApi } from '../api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'foodRescueUser';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// NOTE: the backend has no tokens yet. The logged-in user is kept in localStorage
// so the UI can show the right screens for their role. This is NOT real security.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const saveUser = useCallback((next) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const loggedIn = await authApi.login(email, password);
      saveUser(loggedIn);
      return loggedIn;
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

  const logout = useCallback(() => saveUser(null), [saveUser]);

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

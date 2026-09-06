import { createContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const AuthContext = createContext({
  loading: true,
  accessToken: null,
  setAccessToken: () => {},
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to the global fetch interceptor events
  useEffect(() => {
    const handleTokenRefreshed = (e) => {
      setAccessToken(e.detail.accessToken);
      setUser(e.detail.user);
    };

    const handleLogoutRequired = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener('token_refreshed', handleTokenRefreshed);
    window.addEventListener('logout_required', handleLogoutRequired);

    return () => {
      window.removeEventListener('token_refreshed', handleTokenRefreshed);
      window.removeEventListener('logout_required', handleLogoutRequired);
    };
  }, []);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    } catch (err) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        accessToken,
        setAccessToken,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

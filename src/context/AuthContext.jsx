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

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../lib/types";
import { api } from "../lib/mock-api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    // Properly extract token — "token" key first, then parse "user" JSON object
    let token = localStorage.getItem("token");
    if (!token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try { token = JSON.parse(userStr).token; } catch {}
      }
    }
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
      } else {
        // null = 401 = token is explicitly invalid — safe to clear
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch {
      // Network/server error — do NOT clear the token, just fail gracefully
      // User will appear logged out in UI until next successful refresh
      console.warn("[Auth] Could not verify session — keeping token for retry");
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginUser = (u: User) => setUser(u);
  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

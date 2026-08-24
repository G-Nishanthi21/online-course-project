import { createContext, useState, useEffect, useContext } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("learnhub_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/accounts/me/`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setUser(data);
          localStorage.setItem("learnhub_user", JSON.stringify(data));
        } else {
          setUser(null);
          localStorage.removeItem("learnhub_user");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.non_field_errors || "Login failed");
    }

    setUser(data.user);
    localStorage.setItem("learnhub_user", JSON.stringify(data.user));
    return data.user;
  };

  const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = typeof data === "object" ? Object.values(data).flat().join(" ") : "Registration failed";
      throw new Error(errorMsg);
    }

    setUser(data.user);
    localStorage.setItem("learnhub_user", JSON.stringify(data.user));
    return data.user;
  };

  const logoutUser = async () => {
    try {
      await fetch(`${API_BASE_URL}/accounts/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    localStorage.removeItem("learnhub_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useState, useEffect, useContext } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("learnhub_user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch (error) {
      console.error("Saved user error:", error);
      localStorage.removeItem("learnhub_user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK CURRENT USER
  // =====================================================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/accounts/me/`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        // Backend returned HTML instead of JSON
        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error(
            "ME API returned non-JSON:",
            text
          );

          // Do NOT show JSON parse error
          // Keep existing login information if available
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (response.ok && data) {
          setUser(data);

          localStorage.setItem(
            "learnhub_user",
            JSON.stringify(data)
          );
        } else {
          setUser(null);

          localStorage.removeItem(
            "learnhub_user"
          );
        }
      } catch (error) {
        console.error(
          "Check user error:",
          error
        );

        // Do not crash application
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================
  const loginUser = async (username, password) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/login/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      // =================================================
      // IMPORTANT:
      // If backend sends HTML instead of JSON
      // =================================================
      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "LOGIN API returned HTML/non-JSON:",
          text
        );

        throw new Error(
          "Unable to connect to login service. Please check the backend API."
        );
      }

      const data = await response.json();

      console.log(
        "Login API response:",
        data
      );

      // =================================================
      // LOGIN ERROR
      // =================================================
      if (!response.ok) {
        let errorMessage = "Login failed.";

        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.non_field_errors) {
          if (
            Array.isArray(
              data.non_field_errors
            )
          ) {
            errorMessage =
              data.non_field_errors.join(" ");
          } else {
            errorMessage =
              data.non_field_errors;
          }
        } else if (typeof data === "object") {
          const messages =
            Object.values(data)
              .flat()
              .filter(Boolean)
              .join(" ");

          if (messages) {
            errorMessage = messages;
          }
        }

        throw new Error(errorMessage);
      }

      // =================================================
      // CHECK USER RESPONSE
      // =================================================
      if (!data.user) {
        throw new Error(
          "Login successful, but user information was not received."
        );
      }

      // =================================================
      // SAVE USER
      // =================================================
      setUser(data.user);

      localStorage.setItem(
        "learnhub_user",
        JSON.stringify(data.user)
      );

      // =================================================
      // SAVE TOKEN IF BACKEND RETURNS TOKEN
      // =================================================
      if (data.access) {
        localStorage.setItem(
          "access_token",
          data.access
        );
      }

      if (data.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token
        );
      }

      if (data.token) {
        localStorage.setItem(
          "access_token",
          data.token
        );
      }

      return data.user;

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================
  const registerUser = async (userData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/accounts/register/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          credentials: "include",

          body: JSON.stringify(userData),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      // =================================================
      // BACKEND RETURNED HTML
      // =================================================
      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "REGISTER API returned HTML/non-JSON:",
          text
        );

        throw new Error(
          "Unable to connect to registration service. Please check the backend API."
        );
      }

      const data = await response.json();

      console.log(
        "Register API response:",
        data
      );

      // =================================================
      // REGISTER ERROR
      // =================================================
      if (!response.ok) {
        let errorMessage =
          "Registration failed.";

        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (
          typeof data === "object"
        ) {
          const messages =
            Object.values(data)
              .flat()
              .filter(Boolean)
              .join(" ");

          if (messages) {
            errorMessage = messages;
          }
        }

        throw new Error(errorMessage);
      }

      // =================================================
      // CHECK USER
      // =================================================
      if (!data.user) {
        throw new Error(
          "Registration successful, but user information was not received."
        );
      }

      // =================================================
      // SAVE USER
      // =================================================
      setUser(data.user);

      localStorage.setItem(
        "learnhub_user",
        JSON.stringify(data.user)
      );

      // =================================================
      // SAVE TOKEN
      // =================================================
      if (data.access) {
        localStorage.setItem(
          "access_token",
          data.access
        );
      }

      if (data.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token
        );
      }

      if (data.token) {
        localStorage.setItem(
          "access_token",
          data.token
        );
      }

      return data.user;

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const logoutUser = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/accounts/logout/`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    // Clear React state
    setUser(null);

    // Clear local storage
    localStorage.removeItem(
      "learnhub_user"
    );

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "access"
    );

    localStorage.removeItem(
      "token"
    );
  };

  // =====================================================
  // CONTEXT
  // =====================================================
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =======================================================
// USE AUTH
// =======================================================
export function useAuth() {
  return useContext(AuthContext);
}
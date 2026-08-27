import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // =====================================================
  // GET SAVED USER
  // =====================================================
  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("learnhub_user");

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
  // API URLS
  // =====================================================
  const ME_URL =
    `${API_BASE_URL}/api/accounts/me/`;

  const LOGIN_URL =
    `${API_BASE_URL}/api/accounts/login/`;

  const REGISTER_URL =
    `${API_BASE_URL}/api/accounts/register/`;

  const LOGOUT_URL =
    `${API_BASE_URL}/api/accounts/logout/`;

  // =====================================================
  // GET JWT TOKEN
  // =====================================================
  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // =====================================================
  // CHECK CURRENT USER
  // =====================================================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = getToken();

        // If there is no token, skip the request – user is not authenticated yet.
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(
          ME_URL,
          {
            method: "GET",
            credentials: "include",
            headers,
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "ME API returned non-JSON:",
            text
          );

          return;
        }

        const data =
          await response.json();

        console.log(
          "Current user response:",
          data
        );

        if (response.ok && data) {
          setUser(data);

          localStorage.setItem(
            "learnhub_user",
            JSON.stringify(data)
          );
        } else {
          if (response.status === 401) {
            console.warn(
              "JWT token is missing or expired."
            );
          }
        }

      } catch (error) {
        console.error(
          "Check user error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // =====================================================
  // LOGIN USER
  // =====================================================
  const loginUser = async (
    username,
    password
  ) => {
    try {
      const response =
        await fetch(
          LOGIN_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              username,
              password,
            }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "LOGIN API returned non-JSON:",
          text
        );

        throw new Error(
          "Unable to connect to login service. Please check the backend API."
        );
      }

      const data =
        await response.json();

      console.log(
        "Login API response:",
        data
      );

      // =================================================
      // LOGIN FAILED
      // =================================================
      if (!response.ok) {
        let errorMessage =
          "Login failed.";

        if (data.detail) {
          errorMessage =
            data.detail;
        } else if (data.error) {
          errorMessage =
            data.error;
        } else if (
          data.non_field_errors
        ) {
          errorMessage =
            Array.isArray(
              data.non_field_errors
            )
              ? data.non_field_errors.join(" ")
              : data.non_field_errors;
        } else if (
          typeof data === "object"
        ) {
          const messages =
            Object.values(data)
              .flat()
              .filter(Boolean)
              .join(" ");

          if (messages) {
            errorMessage =
              messages;
          }
        }

        throw new Error(
          errorMessage
        );
      }

      // =================================================
      // SAVE JWT TOKEN
      // =================================================
      const token =
      data.access ||
      data.access_token ||
      data.token;

    if (token) {
      // Store in both localStorage and sessionStorage for robustness
      localStorage.setItem("access_token", token);
      sessionStorage.setItem("access_token", token);
      console.log("JWT access token saved successfully.");
    } else {
      console.warn("Login response does not contain JWT access token.");
    }

      // =================================================
      // SAVE USER
      // =================================================
      if (data.user) {
        setUser(data.user);

        localStorage.setItem(
          "learnhub_user",
          JSON.stringify(data.user)
        );

        return data.user;
      }

      // Some APIs return user directly
      if (
        data.username ||
        data.email ||
        data.id
      ) {
        setUser(data);

        localStorage.setItem(
          "learnhub_user",
          JSON.stringify(data)
        );

        return data;
      }

      throw new Error(
        "Login successful, but user information was not received."
      );

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // REGISTER USER
  // =====================================================
  const registerUser =
    async (userData) => {
      try {
        const response =
          await fetch(
            REGISTER_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              credentials: "include",

              body:
                JSON.stringify(
                  userData
                ),
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "REGISTER API returned non-JSON:",
            text
          );

          throw new Error(
            "Unable to connect to registration service. Please check the backend API."
          );
        }

        const data =
          await response.json();

        console.log(
          "Register API response:",
          data
        );

        if (!response.ok) {
          let errorMessage =
            "Registration failed.";

          if (data.detail) {
            errorMessage =
              data.detail;
          } else if (data.error) {
            errorMessage =
              data.error;
          } else if (
            typeof data === "object"
          ) {
            const messages =
              Object.values(data)
                .flat()
                .filter(Boolean)
                .join(" ");

            if (messages) {
              errorMessage =
                messages;
            }
          }

          throw new Error(
            errorMessage
          );
        }

        // =================================================
        // SAVE TOKEN
        // =================================================
        const token =
          data.access ||
          data.access_token ||
          data.token;

        if (token) {
          localStorage.setItem(
            "access_token",
            token
          );
        }

        // =================================================
        // SAVE USER
        // =================================================
        if (!data.user) {
          throw new Error(
            "Registration successful, but user information was not received."
          );
        }

        setUser(data.user);

        localStorage.setItem(
          "learnhub_user",
          JSON.stringify(
            data.user
          )
        );

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
  // LOGOUT USER
  // =====================================================
  const logoutUser =
    async () => {
      try {
        const token =
          getToken();

        const headers = {
          Accept:
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        await fetch(
          LOGOUT_URL,
          {
            method: "POST",

            credentials:
              "include",

            headers,
          }
        );

      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      }

      setUser(null);

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
  // AUTH CONTEXT
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

// =====================================================
// USE AUTH
// =====================================================
export function useAuth() {
  return useContext(
    AuthContext
  );
}
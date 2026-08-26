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
      console.error(
        "Saved user error:",
        error
      );

      localStorage.removeItem(
        "learnhub_user"
      );

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
  // CHECK CURRENT USER
  // =====================================================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(
          ME_URL,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        // -------------------------------------------------
        // Backend returned HTML
        // -------------------------------------------------
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

        if (
          response.ok &&
          data
        ) {
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
              username:
                username,

              password:
                password,
            }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      // -------------------------------------------------
      // HTML / non JSON response
      // -------------------------------------------------
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

      // -------------------------------------------------
      // LOGIN FAILED
      // -------------------------------------------------
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
          if (
            Array.isArray(
              data.non_field_errors
            )
          ) {
            errorMessage =
              data.non_field_errors.join(
                " "
              );
          } else {
            errorMessage =
              data.non_field_errors;
          }
        } else if (
          typeof data ===
          "object"
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

      // -------------------------------------------------
      // USER NOT RETURNED
      // -------------------------------------------------
      if (!data.user) {
        throw new Error(
          "Login successful, but user information was not received."
        );
      }

      // -------------------------------------------------
      // SAVE USER
      // -------------------------------------------------
      setUser(data.user);

      localStorage.setItem(
        "learnhub_user",
        JSON.stringify(
          data.user
        )
      );

      // -------------------------------------------------
      // SAVE TOKEN IF AVAILABLE
      // -------------------------------------------------
      if (data.access) {
        localStorage.setItem(
          "access_token",
          data.access
        );
      }

      if (
        data.access_token
      ) {
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

              credentials:
                "include",

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

        // -------------------------------------------------
        // HTML / NON JSON RESPONSE
        // -------------------------------------------------
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

        // -------------------------------------------------
        // REGISTRATION FAILED
        // -------------------------------------------------
        if (!response.ok) {
          let errorMessage =
            "Registration failed.";

          if (data.detail) {
            errorMessage =
              data.detail;
          } else if (
            data.error
          ) {
            errorMessage =
              data.error;
          } else if (
            typeof data ===
            "object"
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

        // -------------------------------------------------
        // USER NOT RETURNED
        // -------------------------------------------------
        if (!data.user) {
          throw new Error(
            "Registration successful, but user information was not received."
          );
        }

        // -------------------------------------------------
        // SAVE USER
        // -------------------------------------------------
        setUser(data.user);

        localStorage.setItem(
          "learnhub_user",
          JSON.stringify(
            data.user
          )
        );

        // -------------------------------------------------
        // SAVE TOKEN IF AVAILABLE
        // -------------------------------------------------
        if (data.access) {
          localStorage.setItem(
            "access_token",
            data.access
          );
        }

        if (
          data.access_token
        ) {
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
  // LOGOUT USER
  // =====================================================
  const logoutUser =
    async () => {
      try {
        await fetch(
          LOGOUT_URL,
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      }

      // -------------------------------------------------
      // CLEAR USER
      // -------------------------------------------------
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

// =======================================================
// USE AUTH
// =======================================================
export function useAuth() {
  return useContext(
    AuthContext
  );
}
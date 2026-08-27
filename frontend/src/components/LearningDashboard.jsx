import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LearningDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Retrieve token from possible keys used across app
  const authToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  // Determine user display name
  const userName =
    user?.first_name
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : user?.username || "User";

  useEffect(() => {
    if (!authToken) {
      // redirect to login if not authenticated
      navigate("/login");
    }
  }, [authToken, navigate]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        My Learning Dashboard
      </h1>
      <p style={{ marginTop: "0.5rem" }}>
        Welcome back, {userName}! Track your progress and continue learning.
      </p>
      <Link
        to="/courses"
        style={{
          display: "inline-block",
          marginTop: "0.75rem",
          color: "#2563eb",
          textDecoration: "underline",
        }}
      >
        + Explore More Courses
      </Link>
    </div>
  );
}

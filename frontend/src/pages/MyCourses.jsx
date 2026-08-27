import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function MyCourses() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Retrieve token from possible keys used across app
  const authToken =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  // If no token, redirect to login
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const token = authToken;

        if (!token) {
  // No token, abort loading
  return;
}

        const response = await fetch(
          `${API_BASE_URL}/api/enrollments/`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },

            credentials: "include",
          }
        );

        console.log(
          "Enrollment API status:",
          response.status
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text = await response.text();

          console.error(
            "Enrollment API returned non-JSON:",
            text
          );

          throw new Error(
            "Unable to load enrolled courses."
          );
        }

        const data = await response.json();

        console.log(
          "Enrollment API response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load enrolled courses."
          );
        }

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (
          Array.isArray(data.results)
        ) {
          list = data.results;
        } else if (
          Array.isArray(data.value)
        ) {
          list = data.value;
        }

        setEnrollments(list);

      } catch (err) {
        console.error(
          "My Courses error:",
          err
        );

        setError(
          err.message ||
            "Unable to load enrolled courses."
        );

        setEnrollments([]);

      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadEnrollments();
    }

  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container page-padding text-center">
        <h2>
          Loading your dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="container page-padding">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <h1>
            My Learning Dashboard
          </h1>

          <p className="subtitle">
            Welcome back,{" "}
            {user?.first_name ||
              user?.username ||
              "Student"}
            ! Track your progress and continue
            learning.
          </p>

        </div>

        <Link
          to="/courses"
          className="btn-secondary"
        >
          + Explore More Courses
        </Link>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="auth-error"
          style={{
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* EMPTY */}

      {!error &&
      enrollments.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            🎓
          </div>

          <h2>
            No Enrolled Courses Yet
          </h2>

          <p>
            Explore our library of courses
            and start learning today.
          </p>

          <Link
            to="/courses"
            className="btn-primary"
            style={{
              marginTop: "15px",
            }}
          >
            Browse Courses
          </Link>

        </div>

      ) : (

        /* COURSES */

        <div className="courses-grid">

          {enrollments.map((item) => {

            const course =
              item.course_details || {};

            const progress =
              Number(item.progress) || 0;

            const courseId =
              course.id ||
              item.course;

            const title =
              course.title ||
              "Course Title";

            const image =
              course.image ||
              "/images/image1.jpg";

            const level =
              course.level ||
              "Beginner";

            const status =
              item.status ||
              "active";

            return (

              <div
                key={item.id}
                className="course-card"
              >

                {/* IMAGE */}

                <div className="card-media">

                  <img
                    src={image}
                    alt={title}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "/images/image1.jpg";
                    }}
                  />

                  <span
                    className={`status-badge ${status}`}
                  >
                    {String(
                      status
                    ).toUpperCase()}
                  </span>

                </div>

                {/* BODY */}

                <div className="card-body">

                  <span className="category-tag">
                    {level}
                  </span>

                  <h3 className="card-title">
                    {title}
                  </h3>

                  {/* PROGRESS */}

                  <div className="progress-section">

                    <div className="progress-label">

                      <span>
                        Course Progress
                      </span>

                      <span>
                        <strong>
                          {progress}%
                        </strong>
                      </span>

                    </div>

                    <div className="progress-bar-bg">

                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              progress,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* BUTTON */}

                  <div className="card-actions">

                    <Link
                      to={`/courses/${courseId}/learn`}
                      className="btn-primary full-width"
                    >
                      {progress > 0
                        ? "Continue Learning"
                        : "Start Course"}
                    </Link>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default MyCourses;
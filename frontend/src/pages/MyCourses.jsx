import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function MyCourses() {
  const { user, loading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        // IMPORTANT:
        // Correct backend API path
        const response = await fetch(
          `${API_BASE_URL}/api/enrollments/`,
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

        console.log(
          "My Courses API status:",
          response.status
        );

        // Backend returned HTML
        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error(
            "My Courses API returned non-JSON:",
            text
          );

          throw new Error(
            "Unable to load enrolled courses."
          );
        }

        const data = await response.json();

        console.log(
          "My Courses API response:",
          data
        );

        if (!response.ok) {
          let message =
            "Unable to load enrolled courses.";

          if (data?.detail) {
            message = data.detail;
          }

          throw new Error(message);
        }

        // ==========================================
        // Handle different DRF response formats
        // ==========================================

        let enrollmentList = [];

        if (Array.isArray(data)) {
          enrollmentList = data;
        } else if (Array.isArray(data.results)) {
          enrollmentList = data.results;
        } else if (Array.isArray(data.value)) {
          enrollmentList = data.value;
        } else if (data && typeof data === "object") {
          // Sometimes backend may return a single object
          if (data.id) {
            enrollmentList = [data];
          }
        }

        console.log(
          "Processed enrollments:",
          enrollmentList
        );

        setEnrollments(enrollmentList);
      } catch (err) {
        console.error(
          "Enrollment loading error:",
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

    // Wait until authentication check is complete
    if (!authLoading) {
      loadEnrollments();
    }
  }, [authLoading]);

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (authLoading || loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="container page-padding">

      {/* ======================================
          DASHBOARD HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>
          <h1>My Learning Dashboard</h1>

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

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div
          className="auth-error"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      {/* ======================================
          NO ENROLLMENTS
      ====================================== */}

      {!error && enrollments.length === 0 ? (
        <div className="empty-state">

          <div className="empty-icon">
            🎓
          </div>

          <h2>
            No Enrolled Courses Yet
          </h2>

          <p>
            Explore our library of courses and
            start learning today.
          </p>

          <Link
            to="/courses"
            className="btn-primary"
            style={{ marginTop: "15px" }}
          >
            Browse Courses
          </Link>

        </div>
      ) : (

        /* ======================================
           ENROLLED COURSES
        ====================================== */

        <div className="courses-grid">

          {enrollments.map((item) => {

            // Backend may return course_details
            // or course object
            const course =
              item.course_details ||
              item.course ||
              {};

            const courseId =
              course?.id ||
              item?.course_id ||
              item?.course;

            const progress =
              Number(item?.progress) || 0;

            const courseTitle =
              course?.title ||
              item?.course_title ||
              "Course Title";

            const courseLevel =
              course?.level ||
              item?.level ||
              "Intermediate";

            const courseImage =
              course?.image ||
              "/images/image1.jpg";

            const status =
              item?.status ||
              "active";

            return (
              <div
                key={item.id}
                className="course-card"
              >

                {/* ==================================
                    COURSE IMAGE
                ================================== */}

                <div className="card-media">

                  <img
                    src={courseImage}
                    alt={courseTitle}
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
                    {String(status).toUpperCase()}
                  </span>

                </div>

                {/* ==================================
                    COURSE BODY
                ================================== */}

                <div className="card-body">

                  <span className="category-tag">
                    {courseLevel}
                  </span>

                  <h3 className="card-title">
                    {courseTitle}
                  </h3>

                  {/* ==================================
                      PROGRESS
                  ================================== */}

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

                  {/* ==================================
                      COURSE ACTION
                  ================================== */}

                  <div className="card-actions">

                    {courseId ? (
                      <Link
                        to={`/courses/${courseId}/learn`}
                        className="btn-primary full-width"
                      >
                        {progress > 0
                          ? "Continue Learning"
                          : "Start Course"}
                      </Link>
                    ) : (
                      <Link
                        to="/courses"
                        className="btn-primary full-width"
                      >
                        View Courses
                      </Link>
                    )}

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
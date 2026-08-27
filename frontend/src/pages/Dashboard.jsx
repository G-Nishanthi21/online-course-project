import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function Dashboard() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      null
    );
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const token = getToken();
        let formattedCourses = [];

        if (token) {
          try {
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

            if (response.ok) {
              const data = await response.json();

              let enrollmentList = [];

              if (Array.isArray(data)) {
                enrollmentList = data;
              } else if (Array.isArray(data.results)) {
                enrollmentList = data.results;
              }

              formattedCourses = enrollmentList
                .map((enrollment) => {
                  const course =
                    enrollment.course_details ||
                    enrollment.course_data ||
                    (typeof enrollment.course === "object"
                      ? enrollment.course
                      : null);

                  return {
                    id:
                      course?.id ||
                      enrollment.course_id ||
                      (typeof enrollment.course === "number"
                        ? enrollment.course
                        : null),

                    title:
                      course?.title ||
                      enrollment.title ||
                      "Purchased Course",

                    description:
                      course?.description ||
                      enrollment.description ||
                      "Continue your learning journey.",

                    image:
                      course?.image ||
                      course?.thumbnail ||
                      enrollment.image ||
                      enrollment.thumbnail ||
                      "",

                    progress:
                      Number(enrollment.progress) || 0,

                    enrollmentId: enrollment.id,
                  };
                })
                .filter((course) => course.id);
            }
          } catch (error) {
            console.error("Dashboard API error:", error);
          }
        }

        if (formattedCourses.length === 0) {
          const keys = [
            "enrollments",
            "learnhub_enrollments",
            "my_enrollments",
            "purchased_courses",
            "learnhub_purchased_courses",
          ];

          let localData = [];

          keys.forEach((key) => {
            try {
              const saved = localStorage.getItem(key);

              if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                  localData.push(...parsed);
                }
              }
            } catch (error) {
              console.log("Local storage error:", key);
            }
          });

          formattedCourses = localData
            .map((enrollment) => {
              const course =
                enrollment.course_details ||
                enrollment.course_data ||
                (typeof enrollment.course === "object"
                  ? enrollment.course
                  : null);

              return {
                id:
                  course?.id ||
                  enrollment.course_id ||
                  (typeof enrollment.course === "number"
                    ? enrollment.course
                    : null),

                title:
                  course?.title ||
                  enrollment.title ||
                  "Purchased Course",

                description:
                  course?.description ||
                  enrollment.description ||
                  "Continue your learning journey.",

                image:
                  course?.image ||
                  course?.thumbnail ||
                  enrollment.image ||
                  enrollment.thumbnail ||
                  "",

                progress:
                  Number(enrollment.progress) || 0,

                enrollmentId:
                  enrollment.id || null,
              };
            })
            .filter((course) => course.id);
        }

        const uniqueCourses = formattedCourses.filter(
          (course, index, array) =>
            index ===
            array.findIndex(
              (item) =>
                String(item.id) === String(course.id)
            )
        );

        setCourses(uniqueCourses);
      } catch (error) {
        console.error("Dashboard error:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f5f7ff, #eef2ff)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "50px" }}>📚</div>

          <h2 style={{ color: "#312e81" }}>
            Loading your dashboard...
          </h2>

          <p style={{ color: "#64748b" }}>
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // COURSE LEARNING CONTENT
  // =====================================================

  const getLearningContent = (title) => {
    const courseTitle = title.toLowerCase();

    // PYTHON COURSE
    if (courseTitle.includes("python")) {
      return {
        icon: "🐍",

        topic: "Python Programming",

        explanation:
          "Python is a simple, powerful and beginner-friendly programming language. It is widely used for web development, data science, automation, artificial intelligence and machine learning. In this course, you can learn Python concepts step by step and improve your programming skills through practical examples.",

        code: `# Simple Python Program

name = "LearnHub Student"
age = 22

print("Hello,", name)
print("Age:", age)

if age >= 18:
    print("You are eligible to learn Python!")
else:
    print("Keep learning Python!")`,
      };
    }

    // REACT + DJANGO COURSE
    if (
      courseTitle.includes("react") ||
      courseTitle.includes("django")
    ) {
      return {
        icon: "⚛️",

        topic: "React & Django",

        explanation:
          "React is a JavaScript library used to create modern and interactive user interfaces. Django is a Python web framework used to build secure and scalable backend applications. Together, React and Django can be used to create complete full-stack web applications.",

        code: `// Simple React Component

function Welcome() {
  const name = "LearnHub Student";

  return (
    <div>
      <h2>Hello, {name}!</h2>
      <p>Welcome to React learning.</p>
    </div>
  );
}

export default Welcome;`,
      };
    }

    // DEFAULT
    return {
      icon: "📖",

      topic: "Course Learning",

      explanation:
        "This course contains practical lessons designed to help you understand important concepts step by step. Learn each topic carefully, practice with examples and gradually build your technical skills.",

      code: `// Keep learning and practicing

console.log("Welcome to LearnHub!");
console.log("Practice makes you better.");`,
    };
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div
      style={{
        minHeight: "75vh",
        background:
          "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #fdf4ff 100%)",
        padding: "30px 20px 60px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* =================================================
            SMALL WELCOME CARD
        ================================================= */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: "16px",
            padding: "22px 28px",
            marginBottom: "28px",
            color: "#ffffff",
            boxShadow:
              "0 8px 20px rgba(79,70,229,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 5px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1px",
                opacity: 0.9,
              }}
            >
              👋 WELCOME BACK
            </p>

            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "27px",
                fontWeight: "800",
              }}
            >
              Welcome, {user?.username || "Student"}!
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                opacity: 0.9,
              }}
            >
              Continue learning and achieve your goals 🚀
            </p>
          </div>

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              flexShrink: 0,
            }}
          >
            🎓
          </div>
        </div>

        {/* =================================================
            MY LEARNING
        ================================================= */}

        {courses.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#312e81",
                  }}
                >
                  📚 My Learning
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Your courses and learning progress
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "8px 15px",
                  borderRadius: "25px",
                  color: "#4f46e5",
                  fontWeight: "700",
                  fontSize: "13px",
                  boxShadow:
                    "0 3px 10px rgba(0,0,0,0.06)",
                }}
              >
                🎓 {courses.length}{" "}
                {courses.length === 1
                  ? "Course"
                  : "Courses"}
              </div>
            </div>

            {/* =================================================
                COURSE CARDS
            ================================================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "25px",
              }}
            >
              {courses.map((course) => {
                const learning =
                  getLearningContent(course.title);

                return (
                  <div
                    key={
                      course.enrollmentId ||
                      course.id
                    }
                    style={{
                      background: "#ffffff",
                      borderRadius: "18px",
                      overflow: "hidden",
                      boxShadow:
                        "0 8px 25px rgba(30,41,59,0.09)",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >

                    {/* COURSE IMAGE */}

                    <div
                      style={{
                        height: "180px",
                        background:
                          "linear-gradient(135deg, #e0e7ff, #f3e8ff)",
                        position: "relative",
                      }}
                    >
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "60px",
                          }}
                        >
                          {learning.icon}
                        </div>
                      )}

                      <div
                        style={{
                          position: "absolute",
                          top: "13px",
                          left: "13px",
                          background:
                            "rgba(79,70,229,0.95)",
                          color: "#ffffff",
                          padding: "6px 12px",
                          borderRadius: "18px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        ✓ PURCHASED
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div
                      style={{
                        padding: "22px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 9px",
                          color: "#1e1b4b",
                          fontSize: "19px",
                          lineHeight: "1.35",
                        }}
                      >
                        {course.title}
                      </h3>

                      <p
                        style={{
                          margin: "0 0 18px",
                          color: "#64748b",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      >
                        {course.description}
                      </p>

                      {/* PROGRESS */}

                      <div
                        style={{
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "7px",
                          }}
                        >
                          <span
                            style={{
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            Course Progress
                          </span>

                          <strong
                            style={{
                              color: "#4f46e5",
                            }}
                          >
                            {course.progress}%
                          </strong>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            background: "#e2e8f0",
                            borderRadius: "20px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                `${course.progress}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #4f46e5, #9333ea)",
                              borderRadius: "20px",
                            }}
                          />
                        </div>
                      </div>

                      {/* START LEARNING */}

                      <div
                        style={{
                          padding: "17px",
                          borderRadius: "14px",
                          background:
                            "linear-gradient(135deg, #eef2ff, #faf5ff)",
                          border:
                            "1px solid #ddd6fe",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 9px",
                            color: "#3730a3",
                            fontSize: "17px",
                          }}
                        >
                          ▶ Start Learning
                        </h4>

                        {/* EXPLANATION */}

                        <p
                          style={{
                            margin: "0 0 17px",
                            color: "#475569",
                            fontSize: "14px",
                            lineHeight: "1.7",
                          }}
                        >
                          {learning.explanation}
                        </p>

                        {/* PRACTICE */}

                        <div
                          style={{
                            background: "#ffffff",
                            borderRadius: "11px",
                            padding: "14px",
                            border:
                              "1px solid #e2e8f0",
                          }}
                        >
                          <h5
                            style={{
                              margin: "0 0 10px",
                              color: "#7e22ce",
                              fontSize: "15px",
                            }}
                          >
                            💻 Practice:{" "}
                            {learning.topic}
                          </h5>

                          <pre
                            style={{
                              margin: 0,
                              padding: "14px",
                              background:
                                "#111827",
                              color: "#e5e7eb",
                              borderRadius: "9px",
                              overflowX: "auto",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            <code>
                              {learning.code}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* NO PURCHASED COURSES */

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "55px 25px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(30,41,59,0.07)",
            }}
          >
            <div
              style={{
                fontSize: "60px",
                marginBottom: "15px",
              }}
            >
              📚
            </div>

            <h2
              style={{
                color: "#1e1b4b",
              }}
            >
              No purchased courses
            </h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: "25px",
              }}
            >
              Purchase a course to start learning.
            </p>

            <Link
              to="/courses"
              style={{
                display: "inline-block",
                padding: "13px 25px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Explore Courses →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
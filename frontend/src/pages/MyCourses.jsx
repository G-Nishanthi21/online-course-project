import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/enrollments/`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setEnrollments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container page-padding">
      <div className="dashboard-header">
        <div>
          <h1>My Learning Dashboard</h1>
          <p className="subtitle">
            Welcome back, {user?.first_name || user?.username || "Student"}! Track your progress and continue learning.
          </p>
        </div>
        <Link to="/courses" className="btn-secondary">
          + Explore More Courses
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h2>No Enrolled Courses Yet</h2>
          <p>Explore our library of courses and start learning today.</p>
          <Link to="/courses" className="btn-primary" style={{ marginTop: "15px" }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="courses-grid">
          {enrollments.map((item) => {
            const course = item.course_details || {};
            const progress = item.progress || 0;

            return (
              <div key={item.id} className="course-card">
                <div className="card-media">
                  <img
                    src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"}
                    alt={course.title}
                  />
                  <span className={`status-badge ${item.status}`}>
                    {(item.status || "ACTIVE").toUpperCase()}
                  </span>
                </div>

                <div className="card-body">
                  <span className="category-tag">{course.level || "Intermediate"}</span>
                  <h3 className="card-title">{course.title || "Course Title"}</h3>

                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Course Progress</span>
                      <span><strong>{progress}%</strong></span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link to={`/courses/${course.id || item.course}/learn`} className="btn-primary full-width">
                      {progress > 0 ? "Continue Learning" : "Start Course"}
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

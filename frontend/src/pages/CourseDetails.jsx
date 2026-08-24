import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/courses/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Course not found");
        return res.json();
      })
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load course details");
        setLoading(false);
      });

    // Check if enrolled
    fetch(`${API_BASE_URL}/enrollments/?course=${id}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((enrollments) => {
        if (Array.isArray(enrollments) && enrollments.length > 0) {
          setIsEnrolled(true);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading course details...</h2>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container page-padding text-center">
        <h2>{error || "Course not found"}</h2>
        <Link to="/courses" className="btn-secondary" style={{ marginTop: "15px" }}>
          Back to Courses
        </Link>
      </div>
    );
  }

  const sections = course.sections || [];

  return (
    <div className="container page-padding max-w-1000">
      <Link to="/courses" className="back-link">
        ← Back to Courses
      </Link>

      <div className="course-hero">
        <div className="hero-details">
          <span className="category-badge">{(course.level || "Beginner").toUpperCase()}</span>
          <h1 className="course-hero-title">{course.title}</h1>
          <p className="course-hero-desc">{course.description}</p>

          <div className="course-meta-pills">
            <span>⭐ <strong>{course.rating}</strong> Rating</span>
            <span>👥 <strong>{course.students_count}</strong> Enrolled Students</span>
            <span>⏱️ <strong>{course.duration}</strong> Total Content</span>
          </div>
        </div>

        <div className="course-preview-card">
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="course-hero-img"
            />
          )}

          <div className="preview-card-body">
            <div className="price-tag">Rs. {course.price}</div>

            {isEnrolled ? (
              <Link to={`/courses/${id}/learn`} className="btn-success full-width">
                ▶ Go to Classroom
              </Link>
            ) : (
              <Link to={`/courses/${id}/enroll`} className="btn-primary full-width">
                Enroll Now
              </Link>
            )}

            <ul className="perks-list">
              <li>✓ Full Lifetime Access</li>
              <li>✓ Interactive Video Lessons</li>
              <li>✓ Progress Tracking</li>
              <li>✓ Certificate of Completion</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="curriculum-container">
        <h2>Course Curriculum</h2>
        <p className="subtitle">{sections.length} Sections • {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} Lectures</p>

        <div className="curriculum-list">
          {sections.map((section) => (
            <div key={section.id} className="curriculum-section-box">
              <h3 className="section-head">
                {section.title}
              </h3>
              <div className="section-lessons">
                {(section.lessons || []).map((lesson) => (
                  <div key={lesson.id} className="lesson-row">
                    <span className="lesson-title-text">▶ {lesson.title}</span>
                    <span className="lesson-duration">{lesson.duration || "15 mins"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;

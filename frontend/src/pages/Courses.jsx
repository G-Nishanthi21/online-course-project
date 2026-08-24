import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/courses/`).then((res) => {
        if (!res.ok) {
          throw new Error(`Courses API error: ${res.status}`);
        }
        return res.json();
      }),

      fetch(`${API_BASE_URL}/api/categories/`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Categories API error: ${res.status}`);
          }
          return res.json();
        })
        .catch(() => []),
    ])
      .then(([courseData, catData]) => {
        setCourses(Array.isArray(courseData) ? courseData : []);
        setCategories(Array.isArray(catData) ? catData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading courses:", err);
        setError("Unable to load courses");
        setLoading(false);
      });
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (course.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      course.category === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading course catalog...</h2>
      </div>
    );
  }

  return (
    <div className="container page-padding">
      <div className="catalog-header">
        <h1>Explore Online Courses</h1>

        <p className="subtitle">
          Discover world-class video courses taught by industry experts
        </p>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search for courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses found matching your filter</h3>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="card-media">
                <img
                  src={
                    course.image ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"
                  }
                  alt={course.title}
                />

                <span className="level-badge">
                  {course.level}
                </span>
              </div>

              <div className="card-body">
                <h3 className="card-title">
                  {course.title}
                </h3>

                <p className="card-desc">
                  {(course.description || "").substring(0, 100)}
                  {course.description &&
                  course.description.length > 100
                    ? "..."
                    : ""}
                </p>

                <div className="card-stats">
                  <span>⭐ {course.rating}</span>

                  <span>
                    👥 {course.students_count} students
                  </span>

                  <span>
                    ⏱️ {course.duration}
                  </span>
                </div>

                <div className="card-footer-row">
                  <span className="price font-bold">
                    Rs. {course.price}
                  </span>

                  <Link
                    to={`/courses/${course.id}`}
                    className="btn-primary sm"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
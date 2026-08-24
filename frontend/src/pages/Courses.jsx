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

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

  const getCourseImage = (course) => {
    return course.image || FALLBACK_IMAGE;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const courseResponse = await fetch(
          `${API_BASE_URL}/api/courses/courses/`
        );

        if (!courseResponse.ok) {
          throw new Error(
            `Courses API error: ${courseResponse.status}`
          );
        }

        const courseData = await courseResponse.json();

        console.log("Courses API Response:", courseData);

        let courseList = [];

        if (Array.isArray(courseData)) {
          courseList = courseData;
        } else if (Array.isArray(courseData.value)) {
          courseList = courseData.value;
        } else if (Array.isArray(courseData.results)) {
          courseList = courseData.results;
        }

        setCourses(courseList);

        try {
          const categoryResponse = await fetch(
            `${API_BASE_URL}/api/courses/categories/`
          );

          if (categoryResponse.ok) {
            const categoryData =
              await categoryResponse.json();

            console.log(
              "Categories API Response:",
              categoryData
            );

            let categoryList = [];

            if (Array.isArray(categoryData)) {
              categoryList = categoryData;
            } else if (
              Array.isArray(categoryData.value)
            ) {
              categoryList = categoryData.value;
            } else if (
              Array.isArray(categoryData.results)
            ) {
              categoryList = categoryData.results;
            }

            setCategories(categoryList);
          } else {
            setCategories([]);
          }
        } catch (categoryError) {
          console.error(
            "Category loading error:",
            categoryError
          );

          setCategories([]);
        }
      } catch (err) {
        console.error(
          "Error loading courses:",
          err
        );

        setError("Unable to load courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCourses = courses.filter(
    (course) => {
      const search =
        searchTerm.toLowerCase().trim();

      const title = (
        course.title || ""
      ).toLowerCase();

      const description = (
        course.description || ""
      ).toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        description.includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        String(course.category) ===
          String(selectedCategory);

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

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
          Discover world-class video courses taught
          by industry experts
        </p>

        <div className="filter-bar">

          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search for courses, skills, or topics..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }
          >
            <option value="All">
              All Categories
            </option>

            {categories.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {!error && courses.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            color: "#666",
          }}
        >
          Showing{" "}
          <strong>
            {filteredCourses.length}
          </strong>{" "}
          of{" "}
          <strong>
            {courses.length}
          </strong>{" "}
          courses
        </div>
      )}

      {filteredCourses.length === 0 ? (

        <div className="empty-state">

          <h3>
            {courses.length === 0
              ? "No courses available"
              : "No courses found matching your filter"}
          </h3>

          {searchTerm && (
            <p>
              Try searching with a different keyword.
            </p>
          )}

        </div>

      ) : (

        <div className="courses-grid">

          {filteredCourses.map((course) => (

            <div
              key={course.id}
              className="course-card"
            >

              <div className="card-media">

                <img
                  src={getCourseImage(course)}
                  alt={
                    course.title ||
                    "Course image"
                  }
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />

                <span className="level-badge">
                  {course.level
                    ? course.level
                        .charAt(0)
                        .toUpperCase() +
                      course.level.slice(1)
                    : "Beginner"}
                </span>

              </div>

              <div className="card-body">

                <h3 className="card-title">
                  {course.title ||
                    "Untitled Course"}
                </h3>

                <p className="card-desc">
                  {course.description
                    ? course.description.length >
                      100
                      ? course.description.substring(
                          0,
                          100
                        ) + "..."
                      : course.description
                    : "Learn practical skills with this comprehensive online course."}
                </p>

                <div className="card-stats">

                  <span>
                    ⭐{" "}
                    {course.rating || "4.5"}
                  </span>

                  <span>
                    👥{" "}
                    {course.students_count || 0}{" "}
                    students
                  </span>

                  <span>
                    ⏱️{" "}
                    {course.duration || "N/A"}
                  </span>

                </div>

                <div className="card-footer-row">

                  <span className="price font-bold">
                    Rs.{" "}
                    {course.price || "0"}
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
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

  // ================= COURSE IMAGES =================

  const courseImages = {
    1: "/images/image1.jpg",
    2: "/images/image2.avif",
    3: "/images/img3.avif",
    4: "/images/img4.avif",
    5: "/images/img5.jpg",
    6: "/images/img6.jpeg",
  };

  const FALLBACK_IMAGE = "/images/image1.jpg";

  const getCourseImage = (course) => {
    const id = Number(course?.id);
    return courseImages[id] || FALLBACK_IMAGE;
  };

  // ================= LOAD COURSES =================

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const url = `${API_BASE_URL}/api/courses/courses/`;

        console.log("Loading courses from:", url);

        const response = await fetch(url);

        console.log("Courses status:", response.status);

        if (!response.ok) {
          const text = await response.text();

          console.error("Courses API error:", text);

          throw new Error(
            `Courses API returned ${response.status}`
          );
        }

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error(
            "Courses API returned non-JSON:",
            text
          );

          throw new Error(
            "Invalid response from course service."
          );
        }

        const data = await response.json();

        console.log("Courses API Response:", data);

        let courseList = [];

        if (Array.isArray(data)) {
          courseList = data;
        } else if (Array.isArray(data.results)) {
          courseList = data.results;
        } else if (Array.isArray(data.value)) {
          courseList = data.value;
        } else if (Array.isArray(data.data)) {
          courseList = data.data;
        }

        console.log("Final course list:", courseList);

        setCourses(courseList);

        if (courseList.length === 0) {
          console.warn("API returned zero courses.");
        }
      } catch (err) {
        console.error("Error loading courses:", err);

        setError(
          "Unable to load courses. Please try again."
        );

        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // ================= LOAD CATEGORIES =================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const url =
          `${API_BASE_URL}/api/courses/categories/`;

        console.log("Loading categories from:", url);

        const response = await fetch(url);

        if (!response.ok) {
          console.warn(
            "Categories API error:",
            response.status
          );

          return;
        }

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          console.warn(
            "Categories API returned non-JSON."
          );

          return;
        }

        const data = await response.json();

        console.log(
          "Categories API Response:",
          data
        );

        let categoryList = [];

        if (Array.isArray(data)) {
          categoryList = data;
        } else if (Array.isArray(data.results)) {
          categoryList = data.results;
        } else if (Array.isArray(data.value)) {
          categoryList = data.value;
        } else if (Array.isArray(data.data)) {
          categoryList = data.data;
        }

        setCategories(categoryList);
      } catch (err) {
        console.error(
          "Category loading error:",
          err
        );

        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  // ================= SEARCH + CATEGORY FILTER =================

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    const title = (
      course.title || ""
    ).toLowerCase();

    const description = (
      course.description || ""
    ).toLowerCase();

    const matchesSearch =
      title.includes(search) ||
      description.includes(search);

    const courseCategory =
      course.category?.id ??
      course.category;

    const matchesCategory =
      selectedCategory === "All" ||
      String(courseCategory) ===
        String(selectedCategory);

    return (
      matchesSearch &&
      matchesCategory
    );
  });

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading course catalog...</h2>
      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div className="container page-padding">

      {/* HEADER */}

      <div className="catalog-header">

        <h1>Explore Online Courses</h1>

        <p className="subtitle">
          Discover world-class video courses taught
          by industry experts
        </p>

        {/* FILTER BAR */}

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

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* COURSE COUNT */}

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

      {/* NO COURSES */}

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

        /* COURSE GRID */

        <div className="courses-grid">

          {filteredCourses.map((course) => (

            <div
              key={course.id}
              className="course-card"
            >

              {/* IMAGE */}

              <div
                className="card-media"
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >

                <img
                  src={getCourseImage(course)}
                  alt={
                    course.title ||
                    "Course image"
                  }
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      FALLBACK_IMAGE;
                  }}
                />

                {/* LEVEL */}

                <span className="level-badge">
                  {course.level
                    ? course.level
                        .charAt(0)
                        .toUpperCase() +
                      course.level.slice(1)
                    : "Beginner"}
                </span>

              </div>

              {/* COURSE BODY */}

              <div className="card-body">

                {/* TITLE */}

                <h3 className="card-title">
                  {course.title ||
                    "Untitled Course"}
                </h3>

                {/* DESCRIPTION */}

                <p className="card-desc">
                  {course.description
                    ? course.description.length > 100
                      ? course.description.substring(
                          0,
                          100
                        ) + "..."
                      : course.description
                    : "Learn practical skills with this comprehensive online course."}
                </p>

                {/* STATS */}

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

                {/* FOOTER */}

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
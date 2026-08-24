import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Enroll from "./pages/Enroll";
import MyCourses from "./pages/MyCourses";
import Learning from "./pages/Learning";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Navigation() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <span className="logo-icon">🚀</span> LearnHub
        </Link>

        <div className="nav-links">
          <Link to="/courses" className="nav-item">
            Explore Courses
          </Link>

          {user ? (
            <>
              <Link to="/my-courses" className="nav-item highlight">
                My Dashboard
              </Link>
              <div className="user-profile-menu">
                <span className="user-badge">👤 {user.username} ({user.role})</span>
                <button onClick={handleLogout} className="btn-outline sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-outline sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="home-hero-section">
      <div className="container">
        <div className="hero-content">
          <span className="hero-pill">🔥 Accelerate Your Career</span>
          <h1 className="hero-title">
            Learn World-Class Skills <br />
            <span className="gradient-text">On Your Schedule</span>
          </h1>
          <p className="hero-description">
            Build practical, job-ready technology & design skills through project-driven courses taught by real-world experts.
          </p>

          <div className="hero-cta-buttons">
            <Link to="/courses" className="btn-primary lg">
              Explore Courses →
            </Link>
            <Link to="/register" className="btn-secondary lg">
              Create Free Account
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <h3>3+</h3>
              <p>Top Rated Courses</p>
            </div>
            <div className="stat-card">
              <h3>4,500+</h3>
              <p>Active Students</p>
            </div>
            <div className="stat-card">
              <h3>4.8 ★</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Success() {
  return (
    <div className="container page-padding text-center max-w-600">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1>Enrollment Successful!</h1>
        <p>Congratulations! You are now enrolled in the course. You can start learning right away.</p>

        <div style={{ marginTop: "25px", display: "flex", gap: "15px", justifyContent: "center" }}>
          <Link to="/my-courses" className="btn-primary">
            Go to My Dashboard
          </Link>
          <Link to="/courses" className="btn-secondary">
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navigation />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/courses/:id/enroll" element={<Enroll />} />
              <Route path="/courses/:id/learn" element={<Learning />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/enrollment-success" element={<Success />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container text-center">
              <p>© 2026 LearnHub Platform. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // Auto‑redirect to dashboard after a short delay
  useEffect(() => {
    const timer = setTimeout(() => navigate("/my-courses"), 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container page-padding text-center max-w-600">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1>Enrollment Successful!</h1>
        <p>Congratulations! You are now enrolled in the course. You can start learning right away.</p>
        <div style={{ marginTop: "25px", display: "flex", gap: "15px", justifyContent: "center" }}>
          <Link to="/my-courses" className="btn-primary">Go to My Dashboard</Link>
          <Link to="/courses" className="btn-secondary">Browse More Courses</Link>
        </div>
      </div>
    </div>
  );
}

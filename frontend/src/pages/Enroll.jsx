import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function Enroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "",
    email: user?.email || "",
    cardNumber: "4532 •••• •••• 8892",
    expiry: "12/28",
    cvv: "321",
    upiId: "user@upi",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/courses/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/checkout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: id,
          payment_method: paymentMethod,
          student_name: cardData.name,
          student_email: cardData.email,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Payment failed. Please sign in or check details.");
      }

      navigate("/enrollment-success");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>Loading course checkout...</h2>
      </div>
    );
  }

  return (
    <div className="container page-padding max-w-900">
      <Link to={`/courses/${id}`} className="back-link">
        ← Back to Course
      </Link>

      <h1 style={{ marginTop: "15px" }}>Secure Checkout</h1>

      {error && <div className="auth-error">{error}</div>}

      <div className="checkout-grid">
        <div className="checkout-form-box">
          <h3>1. Billing Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              placeholder="Your Name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={cardData.email}
              onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <h3 style={{ marginTop: "25px" }}>2. Payment Method</h3>
          <div className="payment-options">
            <button
              type="button"
              className={`pay-tab ${paymentMethod === "card" ? "active" : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              💳 Credit/Debit Card
            </button>
            <button
              type="button"
              className={`pay-tab ${paymentMethod === "upi" ? "active" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              📱 UPI / QR
            </button>
            <button
              type="button"
              className={`pay-tab ${paymentMethod === "netbanking" ? "active" : ""}`}
              onClick={() => setPaymentMethod("netbanking")}
            >
              🏦 Net Banking
            </button>
          </div>

          {paymentMethod === "card" && (
            <div className="card-fields">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>UPI ID</label>
              <input
                type="text"
                value={cardData.upiId}
                onChange={(e) => setCardData({ ...cardData, upiId: e.target.value })}
                placeholder="username@upi"
              />
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>Select Bank</label>
              <select>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn-primary full-width"
            style={{ marginTop: "20px", fontSize: "18px" }}
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? "Processing Payment..." : `Complete Payment (Rs. ${course?.price || "0"})`}
          </button>
        </div>

        <div className="order-summary-box">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Course Title</span>
            <strong>{course?.title}</strong>
          </div>
          <div className="summary-item">
            <span>Duration</span>
            <span>{course?.duration || "Lifetime Access"}</span>
          </div>
          <div className="summary-item">
            <span>Original Price</span>
            <span>Rs. {course?.price}</span>
          </div>
          <div className="summary-item">
            <span>Discount</span>
            <span style={{ color: "var(--accent-color)" }}>Free Instant Access</span>
          </div>
          <hr />
          <div className="summary-total">
            <span>Total Payable</span>
            <span className="total-price">Rs. {course?.price}</span>
          </div>
          <div className="guarantee-box">
            🔒 256-bit SSL Encrypted Payment & 30-Day Money-Back Guarantee
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enroll;

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import {
  initiateRazorpay,
  verifyPayment,
} from "../services/PaymentService";

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
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  // =====================================================
  // LOAD COURSE
  // =====================================================

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/courses/courses/${id}/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error(
            "Course API returned non-JSON:",
            text
          );

          throw new Error(
            "Unable to load course details. Please check the backend API."
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.error ||
              "Unable to load course details."
          );
        }

        if (!data || !data.id) {
          throw new Error("Course details not found.");
        }

        console.log("Course details:", data);

        setCourse(data);
      } catch (err) {
        console.error("Load course error:", err);

        setError(
          err.message ||
            "Unable to load course details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id]);

  // =====================================================
  // SET USER DETAILS
  // =====================================================

  useEffect(() => {
    if (user) {
      const fullName =
        user.first_name
          ? `${user.first_name} ${
              user.last_name || ""
            }`.trim()
          : user.username || "";

      setCardData((previous) => ({
        ...previous,
        name: fullName,
        email: user.email || "",
      }));
    }
  }, [user]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCardData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getAuthToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token")
    );
  };

  // =====================================================
  // GET ERROR MESSAGE
  // =====================================================

  const getErrorMessage = (data) => {
    if (!data) {
      return "Payment failed.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return Array.isArray(data.detail)
        ? data.detail.join(" ")
        : data.detail;
    }

    if (data.error) {
      return Array.isArray(data.error)
        ? data.error.join(" ")
        : data.error;
    }

    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(" ")
        : data.non_field_errors;
    }

    if (typeof data === "object") {
      const messages = Object.values(data)
        .flat()
        .filter(Boolean)
        .join(" ");

      if (messages) {
        return messages;
      }
    }

    return "Payment failed. Please try again.";
  };

  // =====================================================
  // HANDLE CHECKOUT
  // =====================================================

  const handleCheckout = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // LOGIN CHECK
    // ---------------------------------------------------

    if (!user) {
      alert("Please login before making a payment.");
      navigate("/login");
      return;
    }

    // ---------------------------------------------------
    // COURSE CHECK
    // ---------------------------------------------------

    if (!course || !course.id) {
      setError("Course details are not available.");
      return;
    }

    // ---------------------------------------------------
    // TOKEN CHECK
    // ---------------------------------------------------

    const token = getAuthToken();

    if (!token) {
      alert(
        "Your login session has expired. Please login again."
      );

      navigate("/login");
      return;
    }

    // ---------------------------------------------------
    // BILLING VALIDATION
    // ---------------------------------------------------

    if (!cardData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!cardData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // ---------------------------------------------------
    // CARD VALIDATION
    // ---------------------------------------------------

    if (paymentMethod === "card") {
      if (!cardData.cardNumber.trim()) {
        setError("Please enter your card number.");
        return;
      }

      if (!cardData.expiry.trim()) {
        setError("Please enter card expiry date.");
        return;
      }

      if (!cardData.cvv.trim()) {
        setError("Please enter CVV.");
        return;
      }
    }

    // ---------------------------------------------------
    // UPI VALIDATION
    // ---------------------------------------------------

    if (paymentMethod === "upi") {
      if (!cardData.upiId.trim()) {
        setError("Please enter your UPI ID.");
        return;
      }
    }

    try {
      setProcessing(true);

      // =================================================
      // CREATE PAYMENT ORDER
      // =================================================

      console.log(
        "Creating payment order for course:",
        course.id
      );

      const orderData = await initiateRazorpay({
        course_id: course.id,
        payment_method: paymentMethod,
      });

      console.log(
        "Payment order response:",
        orderData
      );

      if (!orderData) {
        throw new Error(
          "Unable to create payment order."
        );
      }

      // =================================================
      // MOCK PAYMENT
      // =================================================
      //
      // This is for your current test/sandbox flow.
      //
      // If you later use real Razorpay Checkout,
      // replace this section with Razorpay popup.
      // =================================================

      const mockPayment = {
        razorpay_payment_id:
          "pay_mock_" + Date.now(),

        razorpay_order_id:
          orderData.order_id ||
          orderData.id ||
          "order_mock",

        razorpay_signature:
          "mock_signature",
      };

      console.log(
        "Mock payment:",
        mockPayment
      );

      // =================================================
      // VERIFY PAYMENT
      // =================================================

      const verification =
        await verifyPayment({
          ...mockPayment,
          course_id: course.id,
        });

      console.log(
        "Payment verification:",
        verification
      );

      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      if (
        verification &&
        (
          verification.success === true ||
          verification.status === "success" ||
          verification.verified === true ||
          verification.payment_status === "success"
        )
      ) {
        alert(
          "Payment successful! Your course enrollment is confirmed."
        );

        navigate(
          `/enrollment-success?course=${course.id}`
        );

        return;
      }

      // -------------------------------------------------
      // IF BACKEND DOES NOT SEND success FIELD
      // -------------------------------------------------

      if (verification) {
        alert(
          "Payment successful! Your course enrollment is confirmed."
        );

        navigate(
          `/enrollment-success?course=${course.id}`
        );

        return;
      }

      throw new Error(
        "Payment verification failed."
      );
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      const message =
        err?.message ||
        "Payment failed. Please try again.";

      setError(message);

      // -------------------------------------------------
      // SESSION EXPIRED
      // -------------------------------------------------

      if (
        message
          .toLowerCase()
          .includes("login session") ||
        message
          .toLowerCase()
          .includes("expired") ||
        message
          .toLowerCase()
          .includes("authentication") ||
        message
          .toLowerCase()
          .includes("unauthorized")
      ) {
        alert(
          "Your login session has expired. Please login again."
        );

        navigate("/login");
      }
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>
          Loading course checkout...
        </h2>
      </div>
    );
  }

  // =====================================================
  // COURSE ERROR
  // =====================================================

  if (!course) {
    return (
      <div className="container page-padding text-center">
        <h2>
          Unable to load checkout
        </h2>

        <div
          className="auth-error"
          style={{
            marginTop: "20px",
          }}
        >
          {error ||
            "Course details could not be loaded."}
        </div>

        <Link
          to={`/courses/${id}`}
          className="btn-primary"
          style={{
            display: "inline-block",
            marginTop: "20px",
          }}
        >
          ← Back to Course
        </Link>
      </div>
    );
  }

  // =====================================================
  // MAIN CHECKOUT
  // =====================================================

  return (
    <div className="container page-padding max-w-900">

      {/* BACK */}

      <Link
        to={`/courses/${id}`}
        className="back-link"
      >
        ← Back to Course
      </Link>

      {/* TITLE */}

      <h1
        style={{
          marginTop: "15px",
        }}
      >
        Secure Checkout
      </h1>

      {/* ERROR */}

      {error && (
        <div
          className="auth-error"
          style={{
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* CHECKOUT GRID */}

      <div className="checkout-grid">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="checkout-form-box">

          {/* BILLING */}

          <h3>
            1. Billing Information
          </h3>

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={cardData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
            />

          </div>

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={cardData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />

          </div>

          {/* PAYMENT METHOD */}

          <h3
            style={{
              marginTop: "25px",
            }}
          >
            2. Payment Method
          </h3>

          <div className="payment-options">

            {/* CARD */}

            <button
              type="button"
              className={`pay-tab ${
                paymentMethod === "card"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPaymentMethod("card")
              }
            >
              💳 Credit/Debit Card
            </button>

            {/* UPI */}

            <button
              type="button"
              className={`pay-tab ${
                paymentMethod === "upi"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPaymentMethod("upi")
              }
            >
              📱 UPI / QR
            </button>

            {/* NET BANKING */}

            <button
              type="button"
              className={`pay-tab ${
                paymentMethod ===
                "netbanking"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPaymentMethod(
                  "netbanking"
                )
              }
            >
              🏦 Net Banking
            </button>

          </div>

          {/* =================================================
              CARD
          ================================================= */}

          {paymentMethod === "card" && (
            <div className="card-fields">

              <div className="form-group">

                <label>
                  Card Number
                </label>

                <input
                  type="text"
                  name="cardNumber"
                  value={
                    cardData.cardNumber
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Card Number"
                  maxLength="19"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Expiry Date
                  </label>

                  <input
                    type="text"
                    name="expiry"
                    value={
                      cardData.expiry
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="MM/YY"
                    maxLength="5"
                  />

                </div>

                <div className="form-group">

                  <label>
                    CVV
                  </label>

                  <input
                    type="password"
                    name="cvv"
                    value={
                      cardData.cvv
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="CVV"
                    maxLength="4"
                  />

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              UPI
          ================================================= */}

          {paymentMethod === "upi" && (
            <div
              className="form-group"
              style={{
                marginTop: "15px",
              }}
            >

              <label>
                UPI ID
              </label>

              <input
                type="text"
                name="upiId"
                value={
                  cardData.upiId
                }
                onChange={
                  handleInputChange
                }
                placeholder="username@upi"
              />

            </div>
          )}

          {/* =================================================
              NET BANKING
          ================================================= */}

          {paymentMethod ===
            "netbanking" && (
            <div
              className="form-group"
              style={{
                marginTop: "15px",
              }}
            >

              <label>
                Select Bank
              </label>

              <select
                name="bank"
                defaultValue="State Bank of India"
              >
                <option>
                  State Bank of India
                </option>

                <option>
                  HDFC Bank
                </option>

                <option>
                  ICICI Bank
                </option>

                <option>
                  Axis Bank
                </option>

              </select>

            </div>
          )}

          {/* =================================================
              PAYMENT BUTTON
          ================================================= */}

          <button
            type="button"
            className="btn-primary full-width"
            style={{
              marginTop: "20px",
              fontSize: "18px",
            }}
            onClick={
              handleCheckout
            }
            disabled={
              processing ||
              !course
            }
          >
            {processing
              ? "Processing Payment..."
              : `Complete Payment (Rs. ${
                  course?.price || "0"
                })`}
          </button>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="order-summary-box">

          <h3>
            Order Summary
          </h3>

          {/* COURSE */}

          <div className="summary-item">

            <span>
              Course Title
            </span>

            <strong>
              {course?.title ||
                "Course Title"}
            </strong>

          </div>

          {/* DURATION */}

          <div className="summary-item">

            <span>
              Duration
            </span>

            <span>
              {course?.duration ||
                "Lifetime Access"}
            </span>

          </div>

          {/* PRICE */}

          <div className="summary-item">

            <span>
              Original Price
            </span>

            <span>
              Rs.{" "}
              {course?.price || "0"}
            </span>

          </div>

          {/* DISCOUNT */}

          <div className="summary-item">

            <span>
              Discount
            </span>

            <span
              style={{
                color:
                  "var(--accent-color)",
              }}
            >
              Free Instant Access
            </span>

          </div>

          <hr />

          {/* TOTAL */}

          <div className="summary-total">

            <span>
              Total Payable
            </span>

            <span className="total-price">
              Rs.{" "}
              {course?.price || "0"}
            </span>

          </div>

          {/* GUARANTEE */}

          <div className="guarantee-box">

            🔒 256-bit SSL Encrypted
            Payment & 30-Day
            Money-Back Guarantee

          </div>

        </div>

      </div>

    </div>
  );
}

export default Enroll;
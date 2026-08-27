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
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  // =====================================================
  // LOAD COURSE DETAILS
  // =====================================================

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         * Course API path
         */
        const response = await fetch(
          `${API_BASE_URL}/api/courses/courses/${id}/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        console.log(
          "Course API status:",
          response.status
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
            "Unable to load course details."
          );
        }

        const data = await response.json();

        console.log(
          "Course details:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load course details."
          );
        }

        if (!data || !data.id) {
          throw new Error(
            "Course details not found."
          );
        }

        setCourse(data);

      } catch (err) {
        console.error(
          "Course loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load course."
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
  // SET USER BILLING DETAILS
  // =====================================================

  useEffect(() => {
    if (user) {
      setCardData((previous) => ({
        ...previous,

        name: user.first_name
          ? `${user.first_name} ${
              user.last_name || ""
            }`.trim()
          : user.username || "",

        email: user.email || "",
      }));
    }
  }, [user]);

  // =====================================================
  // HANDLE INPUT
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

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token")
    );
  };

  // =====================================================
  // HANDLE CHECKOUT
  // =====================================================

  const handleCheckout = async (e) => {
    e.preventDefault();

    setError("");
    setProcessing(true);

    try {
      // -------------------------------------------------
      // CHECK USER
      // -------------------------------------------------

      if (!user) {
        throw new Error(
          "Please login before making a payment."
        );
      }

      // -------------------------------------------------
      // CHECK COURSE
      // -------------------------------------------------

      if (!course || !course.id) {
        throw new Error(
          "Course details are not available."
        );
      }

      // -------------------------------------------------
      // GET JWT TOKEN
      // -------------------------------------------------

      const token = getToken();

      console.log(
        "Access token exists:",
        Boolean(token)
      );

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      // -------------------------------------------------
      // VALIDATE BILLING
      // -------------------------------------------------

      if (!cardData.name.trim()) {
        throw new Error(
          "Please enter your full name."
        );
      }

      if (!cardData.email.trim()) {
        throw new Error(
          "Please enter your email address."
        );
      }

      // -------------------------------------------------
      // CARD VALIDATION
      // -------------------------------------------------

      if (paymentMethod === "card") {
        if (!cardData.cardNumber.trim()) {
          throw new Error(
            "Please enter your card number."
          );
        }

        if (!cardData.expiry.trim()) {
          throw new Error(
            "Please enter card expiry date."
          );
        }

        if (!cardData.cvv.trim()) {
          throw new Error(
            "Please enter CVV."
          );
        }
      }

      // -------------------------------------------------
      // UPI VALIDATION
      // -------------------------------------------------

      if (paymentMethod === "upi") {
        if (!cardData.upiId.trim()) {
          throw new Error(
            "Please enter your UPI ID."
          );
        }
      }

      console.log(
        "Starting checkout..."
      );

      console.log({
        user: user.username,
        courseId: course.id,
        courseTitle: course.title,
        price: course.price,
        paymentMethod,
      });

      // -------------------------------------------------
      // PAYMENT API
      // -------------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/payments/checkout/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          credentials: "include",

          body: JSON.stringify({
            course_id: course.id,

            payment_method:
              paymentMethod,

            student_name:
              cardData.name,

            student_email:
              cardData.email,
          }),
        }
      );

      console.log(
        "Checkout API status:",
        response.status
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      // -------------------------------------------------
      // NON JSON RESPONSE
      // -------------------------------------------------

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Checkout API returned non-JSON:",
          text
        );

        throw new Error(
          "Payment service returned an invalid response."
        );
      }

      // -------------------------------------------------
      // JSON RESPONSE
      // -------------------------------------------------

      const data =
        await response.json();

      console.log(
        "Checkout API response:",
        data
      );

      // -------------------------------------------------
      // API ERROR
      // -------------------------------------------------

      if (!response.ok) {
        let message =
          "Payment failed. Please try again.";

        if (data?.detail) {
          message = data.detail;
        } else if (data?.error) {
          message = data.error;
        } else if (
          data?.non_field_errors
        ) {
          message = Array.isArray(
            data.non_field_errors
          )
            ? data.non_field_errors.join(" ")
            : data.non_field_errors;
        } else if (
          typeof data === "object"
        ) {
          const messages =
            Object.values(data)
              .flat()
              .filter(Boolean)
              .join(" ");

          if (messages) {
            message = messages;
          }
        }

        throw new Error(message);
      }

      // -------------------------------------------------
      // PAYMENT SUCCESS
      // -------------------------------------------------

      console.log(
        "Payment successful!"
      );

      console.log(
        "Enrollment created:",
        data
      );

      /*
       * Go to enrollment success page.
       */

      navigate(
        "/enrollment-success"
      );

    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setError(
        err.message ||
          "Payment failed. Please try again."
      );

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

  if (error && !course) {
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
          {error}
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
  // MAIN CHECKOUT UI
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
              onChange={
                handleInputChange
              }
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
              onChange={
                handleInputChange
              }
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
                setPaymentMethod(
                  "card"
                )
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
                setPaymentMethod(
                  "upi"
                )
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
import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

function Enroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] =
    useState("card");
  const [processing, setProcessing] =
    useState(false);
  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  // ================= LOAD COURSE =================

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          `${API_BASE_URL}/api/courses/courses/${id}/`;

        console.log(
          "Loading checkout course from:",
          url
        );

        const response = await fetch(url);

        console.log(
          "Checkout course status:",
          response.status
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          const text = await response.text();

          console.error(
            "Checkout course API error:",
            text
          );

          throw new Error(
            `Unable to load course details. Server returned ${response.status}.`
          );
        }

        if (
          !contentType.includes("application/json")
        ) {
          const text = await response.text();

          console.error(
            "Checkout API returned non-JSON:",
            text
          );

          throw new Error(
            "Invalid response from course service."
          );
        }

        const data = await response.json();

        console.log(
          "Checkout course response:",
          data
        );

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
    } else {
      setError(
        "Course ID is missing."
      );
      setLoading(false);
    }
  }, [id]);

  // ================= USER DETAILS =================

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

  // ================= CHECKOUT =================

  const handleCheckout = async (e) => {
    e.preventDefault();

    setError("");
    setProcessing(true);

    try {
      // Check login

      if (!user) {
        throw new Error(
          "Please login before making a payment."
        );
      }

      // Check course

      if (!course || !course.id) {
        throw new Error(
          "Course details are not available."
        );
      }

      // Check token

      const token =
        localStorage.getItem(
          "access_token"
        ) ||
        localStorage.getItem(
          "access"
        ) ||
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      console.log(
        "Checkout information:",
        {
          courseId: course.id,
          courseTitle: course.title,
          price: course.price,
          paymentMethod,
          username: user.username,
        }
      );

      /*
       * TEMPORARY CHECKOUT
       *
       * This currently confirms that:
       * 1. User is logged in
       * 2. Course is loaded
       * 3. Course ID is available
       * 4. Price is available
       *
       * Razorpay/payment API can be connected here.
       */

      alert(
        `Course: ${course.title}\nPrice: Rs. ${course.price}\nPayment Method: ${paymentMethod}\n\nCourse and login data are working correctly.`
      );

      /*
       * Do not navigate yet because the actual
       * payment/enrollment API is not connected.
       */
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

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="container page-padding text-center">
        <h2>
          Loading course checkout...
        </h2>
      </div>
    );
  }

  // ================= ERROR =================

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

  // ================= MAIN CHECKOUT =================

  return (
    <div className="container page-padding max-w-900">

      {/* BACK BUTTON */}

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
        <div className="auth-error">
          {error}
        </div>
      )}

      <div className="checkout-grid">

        {/* ================= LEFT SIDE ================= */}

        <div className="checkout-form-box">

          <h3>
            1. Billing Information
          </h3>

          {/* NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={cardData.name}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  name: e.target.value,
                })
              }
              placeholder="Your Name"
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={cardData.email}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  email: e.target.value,
                })
              }
              placeholder="your@email.com"
            />

          </div>

          {/* PAYMENT */}

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

          {/* ================= CARD ================= */}

          {paymentMethod === "card" && (

            <div className="card-fields">

              <div className="form-group">

                <label>
                  Card Number
                </label>

                <input
                  type="text"
                  value={
                    cardData.cardNumber
                  }
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      cardNumber:
                        e.target.value,
                    })
                  }
                  placeholder="Card Number"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Expiry Date
                  </label>

                  <input
                    type="text"
                    value={
                      cardData.expiry
                    }
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        expiry:
                          e.target.value,
                      })
                    }
                    placeholder="MM/YY"
                  />

                </div>

                <div className="form-group">

                  <label>
                    CVV
                  </label>

                  <input
                    type="password"
                    value={
                      cardData.cvv
                    }
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cvv: e.target.value,
                      })
                    }
                    placeholder="CVV"
                  />

                </div>

              </div>

            </div>
          )}

          {/* ================= UPI ================= */}

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
                value={
                  cardData.upiId
                }
                onChange={(e) =>
                  setCardData({
                    ...cardData,
                    upiId:
                      e.target.value,
                  })
                }
                placeholder="username@upi"
              />

            </div>
          )}

          {/* ================= NET BANKING ================= */}

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

              <select>

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

          {/* ================= PAYMENT BUTTON ================= */}

          <button
            type="button"
            className="btn-primary full-width"
            style={{
              marginTop: "20px",
              fontSize: "18px",
            }}
            onClick={handleCheckout}
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

        {/* ================= RIGHT SIDE ================= */}

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
import { API_BASE_URL } from "../config";

// Helper to get auth token from local storage (consistent with other services)
const getAuthToken = () => (
  localStorage.getItem("access_token") ||
  localStorage.getItem("access") ||
  localStorage.getItem("token")
);

/**
 * Initiates a Razorpay order on the backend.
 * The backend should create an order via Razorpay SDK and return { orderId, amount, currency }.
 */
export const initiateRazorpay = async (courseId, paymentMethod) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token missing");
  }
  const response = await fetch(`${API_BASE_URL}/api/payments/create-order/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ course_id: courseId, payment_method: paymentMethod }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to create Razorpay order");
  }
  return data; // expects { order_id, amount, currency }
};

/**
 * Verifies the Razorpay payment on the backend.
 * Sends payment_id, order_id and signature for verification.
 */
export const verifyPayment = async (payload) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token missing");
  }
  const response = await fetch(`${API_BASE_URL}/api/payments/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Payment verification failed");
  }
  return data; // { success: true, enrollment: {...} }
};

export const handlePaymentSuccess = async (paymentResponse, orderInfo, courseId) => {
  // paymentResponse contains razorpay_payment_id, razorpay_order_id, razorpay_signature
  const verificationPayload = {
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_signature: paymentResponse.razorpay_signature,
    course_id: courseId,
  };
  const result = await verifyPayment(verificationPayload);
  return result;
};

export const handlePaymentFailure = (error) => {
  console.error("Razorpay payment failed", error);
  throw new Error(error?.error?.description || "Payment was not completed");
};

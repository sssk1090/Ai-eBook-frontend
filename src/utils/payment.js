
import axios from "axios";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(true);
      } else {
        reject(new Error("Razorpay Checkout could not be loaded."));
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Unable to load Razorpay. Check your internet connection."
        )
      );
    };

    document.body.appendChild(script);
  });

export const payForGeneration = async ({ token, paymentType }) => {
  if (!token) {
    throw new Error("Please log in before making a payment.");
  }

  if (!["outline", "chapter"].includes(paymentType)) {
    throw new Error("Invalid payment type.");
  }

  await loadRazorpay();

  const response = await axios.post(
    `${API_BASE_URL}/api/payments/create-order`,
    { paymentType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { keyId, orderId, amount, currency } = response.data;

  if (!keyId || !orderId || !amount || !currency) {
    throw new Error("The server returned an invalid payment order.");
  }

  return new Promise((resolve, reject) => {
    let finished = false;

    const checkout = new window.Razorpay({
      key: keyId,
      order_id: orderId,
      amount,
      currency,
      name: "AI eBook Creator",
      description:
        paymentType === "outline"
          ? "One additional outline generation"
          : "One additional chapter generation",
      theme: { color: "#7c3aed" },

      handler: async (paymentResponse) => {
        if (finished) return;
        finished = true;

        try {
          await axios.post(
            `${API_BASE_URL}/api/payments/verify`,
            {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          resolve(orderId);
        } catch (error) {
          reject(
            new Error(
              error.response?.data?.message ||
                "Payment verification failed. Check your payment status before trying again."
            )
          );
        }
      },

      modal: {
        ondismiss: () => {
          if (!finished) {
            finished = true;
            reject(new Error("Payment was cancelled."));
          }
        },
      },
    });

    checkout.on("payment.failed", (event) => {
      if (finished) return;
      finished = true;

      reject(
        new Error(
          event.error?.description || "Payment failed. Please try again."
        )
      );
    });

    checkout.open();
  });
};

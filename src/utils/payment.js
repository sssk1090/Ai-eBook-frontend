
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

export const payForGeneration = async ({
  token,
  paymentType,
  chapterCount,
}) => {
  if (!token) {
    throw new Error("Please log in before making a payment.");
  }

  if (!["outline", "chapter"].includes(paymentType)) {
    throw new Error("Invalid payment type.");
  }

  // An outline payment is needed only for more than 4 chapters.
  // Pricing: (chapter count - 4) * ₹5.
  if (paymentType === "outline") {
    const count = Number(chapterCount);

    if (
      !Number.isInteger(count) ||
      count <= 4
    ) {
      throw new Error(
        "A paid outline requires more than 4 chapters."
      );
    }
  }

  await loadRazorpay();

  // Ask the backend to create the order.
  // The backend must calculate and validate the actual amount.
  const response = await axios.post(
    `${API_BASE_URL}/api/payments/create-order`,
    {
      paymentType,
      ...(paymentType === "outline"
        ? { chapterCount: Number(chapterCount) }
        : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { keyId, orderId, amount, currency } = response.data;

  if (!keyId || !orderId || !amount || !currency) {
    throw new Error(
      "The server returned an invalid payment order."
    );
  }

  // Open Razorpay checkout and verify payment on the backend.
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
          ? `Outline generation for ${Number(chapterCount)} chapters`
          : "One additional chapter content generation",

      theme: {
        color: "#7c3aed",
      },

      handler: async (paymentResponse) => {
        if (finished) return;
        finished = true;

        try {
          await axios.post(
            `${API_BASE_URL}/api/payments/verify`,
            {
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Return the verified order ID to the caller.
          // The AI generation request can then use this ID.
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
          event.error?.description ||
            "Payment failed. Please try again."
        )
      );
    });

    checkout.open();
  });
};

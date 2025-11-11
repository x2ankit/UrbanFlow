import React, { useEffect } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type Props = {
  amountInRupees: number;
  description?: string;
  onSuccess?: (payload: any) => void;
  onFailure?: (err: any) => void;
};

export const RazorpayCheckout: React.FC<Props> = ({ amountInRupees, description = "Ride Payment", onSuccess, onFailure }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const openCheckout = async () => {
    if (!window.Razorpay) return onFailure?.({ message: "Razorpay SDK not loaded" });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: Math.round(amountInRupees * 100), // paise
      currency: "INR",
      name: "UrbanFlow",
      description,
      handler: function (response: any) {
        onSuccess?.(response);
      },
      modal: {
        ondismiss: function() {
          // user closed checkout
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={openCheckout} className="btn btn-primary">
      Pay ₹{amountInRupees}
    </button>
  );
};

export default RazorpayCheckout;

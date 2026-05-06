// const Flutterwave = require("flutterwave-node-v3");
const axios = require("axios");

// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY,
// );

const flutterwaveInitializePayment = async (paymentData) => {
  try {
    const payload = {
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      currency: "NGN",
      redirect_url: paymentData.redirect_url,
      customer: {
        email: paymentData.email,
        name: paymentData.name || "Customer",
      },
      enckey: process.env.FLW_ENCRYPTION_KEY,
    };
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      },
    );
    console.log("Flutterwave initialization response:", response);
    return response;
  } catch (error) {
    console.error("Flutterwave initialization error:", error);
    throw new Error("Failed to initialize payment with Flutterwave");
  }
};

module.exports = {
  flutterwaveInitializePayment,
};

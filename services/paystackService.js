const axios = require("axios");

exports.initializePayment = async (email, amount, reference) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // 🚨 Paystack uses kobo
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Paystack Error");
  }
};

const axios = require("axios");

exports.initializePayment = async (data) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      data,
      {
        headers: {
          Authorization: `Bearer sk_test_bce4e36c3c8fc2e08cbadca9023bf5122e069275`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("email:", data.email, "response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Paystack initialization error:", error.response?.data);
    throw new Error(JSON.stringify(error.response?.data));
  }
};

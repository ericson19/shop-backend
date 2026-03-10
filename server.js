const express = require("express");
const db = require("./config/db");
const env = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
//routes
const stockRoute = require("./routes/stockRoute");
const categoryRoute = require("./routes/categoryRoute");
const userRoute = require("./routes/userRoutes");
const staffRoute = require("./routes/staffRoute");
const salesRoutes = require("./routes/salesRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const purchaseGoodRoutes = require("./routes/purchaseGoodRoutes");

env.config();

const app = express();

// Test database connection
(async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

app.use(express.json());
app.use(categoryRoute);
app.use(stockRoute);
app.use("/user", userRoute);
app.use("/staff", staffRoute);
app.use("/sales", salesRoutes);
app.use("/payment", paymentRoutes);
app.use("/purchase", purchaseGoodRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the shop backend!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

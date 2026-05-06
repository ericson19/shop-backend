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
const locationRoute = require("./routes/locationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const mailRoutes = require("./routes/mailRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

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

app.use(cors({}));

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
app.use("/location", locationRoute);
app.use("/report", reportRoutes);
app.use("/mail", mailRoutes);
app.use("/settings", settingsRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the shop backend!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

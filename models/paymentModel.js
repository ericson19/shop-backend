const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("./userModel");
const Sale = require("./salesModel");
const Order = require("./orderModel");
const Payment = sequelize.define("Payments", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Sale,
      key: "id",
    },
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Order,
      key: "id",
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
    allowNull: false,
    defaultValue: "pending",
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  screenshot: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
Payment.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Payment, { foreignKey: "userId" });
Payment.belongsTo(Sale, { foreignKey: "saleId" });
Sale.hasMany(Payment, { foreignKey: "saleId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });
Order.hasMany(Payment, { foreignKey: "orderId" });

module.exports = Payment;

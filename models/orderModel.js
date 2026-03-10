const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Sales = require("./salesModel");
const User = require("./userModel");
const Staff = require("./staffModel");

const Order = sequelize.define("Order", {
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
    allowNull: false,
    references: {
      model: Sales,
      key: "id",
    },
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  billingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ),
    allowNull: false,
    defaultValue: "pending",
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  payOnDelivery: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  confirmedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Staff,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  returned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(Sales, { foreignKey: "saleId" });
Sales.hasMany(Order, { foreignKey: "saleId" });
Order.belongsTo(Staff, { foreignKey: "confirmedBy" });
Staff.hasMany(Order, { foreignKey: "confirmedBy" });

module.exports = Order;

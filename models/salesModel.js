const sequelize = require("../config/db");
const User = require("./userModel");
const { DataTypes } = require("sequelize");
// const Order = require("./orderModel");

const Sale = sequelize.define(
  "sales",
  {
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },

    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    // orderId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "Orders",
    //     key: "id",
    //   },
    // },

    invoice: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    taxRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    saleDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    payOnDelivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "sales",
  },
);
Sale.belongsTo(User, { foreignKey: "customerId" });
User.hasMany(Sale, { foreignKey: "customerId" });
// Sale.belongsTo(Order, { foreignKey: "orderId" });
// Order.hasMany(Sale, { foreignKey: "orderId" });

module.exports = Sale;

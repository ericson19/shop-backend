const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Stock = require("./stockModel");
const Sale = require("./salesModel");
const Order = require("./orderModel");
const SaleItems = sequelize.define(
  "SalesItems",
  {
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sale,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Stock,
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

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "salesItems",
  },
);

Sale.hasMany(SaleItems, { foreignKey: "saleId" });
SaleItems.belongsTo(Sale, { foreignKey: "saleId" });
SaleItems.belongsTo(Stock, { foreignKey: "productId" });
Stock.hasMany(SaleItems, { foreignKey: "productId" });
Order.hasMany(SaleItems, { foreignKey: "orderId" });
SaleItems.belongsTo(Order, { foreignKey: "orderId" });
module.exports = SaleItems;

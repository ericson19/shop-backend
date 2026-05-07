const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Return = require("./returnModel");
const Stock = require("./stockModel");
const SalesItems = require("./salesitemsModel");

const ReturnedItems = sequelize.define(
  "returnedItems",
  {
    returnId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Return,
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
    saleItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SalesItems,
        key: "id",
      },
    },
    quantityReturned: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amountReturned: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "returnedItems",
  },
);

ReturnedItems.belongsTo(Return, { foreignKey: "returnId" });
Return.hasMany(ReturnedItems, { foreignKey: "returnId" });
ReturnedItems.belongsTo(Stock, { foreignKey: "productId" });
Stock.hasMany(ReturnedItems, { foreignKey: "productId" });
ReturnedItems.belongsTo(SalesItems, { foreignKey: "saleItemId" });
SalesItems.hasMany(ReturnedItems, { foreignKey: "saleItemId" });

module.exports = ReturnedItems;

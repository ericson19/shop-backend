const sequelize = require("../config/db");
const Staff = require("./staffModel");
const { DataTypes } = require("sequelize");
const Stock = require("./stockModel");

const StockFlow = sequelize.define("StockFlow", {
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stock,
      key: "id",
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  oldStock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  inflowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  movementType: {
    type: DataTypes.ENUM(
      "purchase",
      "return",
      "adjustment",
      "sold",
      "damage",
      "transfer-in",
      "transfer-out",
    ),
    allowNull: false,
  },
  flowType: {
    type: DataTypes.ENUM("in", "out"),
    allowNull: false,
  },

  doneBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Staff,
      key: "id",
    },
  },
});
StockFlow.belongsTo(Stock, { foreignKey: "stockId" });
Stock.hasMany(StockFlow, { foreignKey: "stockId" });
StockFlow.belongsTo(Staff, { foreignKey: "doneBy" });
Staff.hasMany(StockFlow, { foreignKey: "doneBy" });
module.exports = StockFlow;

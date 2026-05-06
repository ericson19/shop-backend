const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Stock = require("./stockModel");
const Staff = require("./staffModel");

const DamagedItem = sequelize.define("damagedItem", {
  quantityDamaged: {
    type: DataTypes.INTEGER,
    required: true,
  },
  reason: {
    type: DataTypes.STRING,
    required: true,
    defaultValue: "No reason provided",
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stock,
      key: "id",
    },
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Staff,
      key: "id",
    },
  },
});

DamagedItem.belongsTo(Stock, { foreignKey: "stockId" });
Stock.hasMany(DamagedItem, { foreignKey: "stockId" });

DamagedItem.belongsTo(Staff, { foreignKey: "staffId" });
Staff.hasMany(DamagedItem, { foreignKey: "staffId" });

module.exports = DamagedItem;

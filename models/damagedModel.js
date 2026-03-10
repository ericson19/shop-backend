const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Stock = require("./stockModel");
const Staff = require("./staffModel");

const Damage = sequelize.define("Damage", {
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stock,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Staff,
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Stock.hasMany(Damage, { foreignKey: "stockId" });
Damage.belongsTo(Stock, { foreignKey: "stockId" });
Staff.hasMany(Damage, { foreignKey: "userId" });
Damage.belongsTo(Staff, { foreignKey: "userId" });
module.exports = Damage;

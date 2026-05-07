const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Sale = require("./salesModel");

const User = require("./userModel");

const Return = sequelize.define(
  "return",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sale,
        key: "id",
      },
    },

    reason: {
      type: DataTypes.ENUM("damaged", "not_needed", "wrong_items"),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    returnDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "returns",
  },
);

Sale.hasMany(Return, { foreignKey: "saleId" });
Return.belongsTo(Sale, { foreignKey: "saleId" });
User.hasMany(Return, { foreignKey: "userId" });
Return.belongsTo(User, { foreignKey: "userId" });

module.exports = Return;

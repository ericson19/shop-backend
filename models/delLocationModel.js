const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const delLocation = sequelize.define(
  "DelLocation",
  {
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "delLocations",
  },
);

module.exports = delLocation;

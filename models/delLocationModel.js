const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const delLocation = sequelize.define("delLocation", {
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
});

module.exports = delLocation;

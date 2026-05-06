const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const City = sequelize.define("City", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
});

module.exports = City;

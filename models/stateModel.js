const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const State = sequelize.define("State", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = State;

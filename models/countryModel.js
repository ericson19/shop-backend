const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Country = sequelize.define(
  "country",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "countries",
  },
);

module.exports = Country;

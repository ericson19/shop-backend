const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Newsletter = sequelize.define(
  "Newsletter",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "newsletters",
  },
);
module.exports = Newsletter;

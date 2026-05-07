const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const MainCategory = sequelize.define(
  "Maincategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "maincategories",
  },
);

module.exports = MainCategory;

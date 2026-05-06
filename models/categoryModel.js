const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const MainCategory = require("./mainCategory");

const Category = sequelize.define(
  "Category",
  {
    name: {
      type: DataTypes.STRING,
      required: true,
    },
    description: {
      type: DataTypes.STRING,
      required: true,
    },
    mainCatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MainCategory,
        key: "id",
      },
    },
  },
  {
    tableName: "categories",
  },
);

Category.belongsTo(MainCategory, { foreignKey: "mainCatId" });
MainCategory.hasMany(Category, { foreignKey: "mainCatId" });
module.exports = Category;

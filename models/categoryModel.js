const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const MainCategory = require("./mainCategory");

const Category = sequelize.define(
  "category",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
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

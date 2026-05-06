const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const MainCategory = require("./mainCategory");

const category = sequelize.define("category", {
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
});

category.belongsTo(MainCategory, { foreignKey: "mainCatId" });
MainCategory.hasMany(category, { foreignKey: "mainCatId" });
module.exports = category;

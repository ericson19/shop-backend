const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Staff = require("./staffModel");
const category = require("./categoryModel");
const Stock = sequelize.define(
  "stock",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    barCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Staff,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: category,
        key: "id",
      },
    },
    lowAlert: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tutorial: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stockDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "stocks",
  },
);
Staff.hasMany(Stock, { foreignKey: "addedBy" });
Stock.belongsTo(Staff, { foreignKey: "addedBy" });
category.hasMany(Stock, { foreignKey: "categoryId" });
Stock.belongsTo(category, { foreignKey: "categoryId" });

module.exports = Stock;

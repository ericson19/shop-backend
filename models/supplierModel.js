const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

// Create a new supplier model
const Supplier = sequelize.define("Supplier", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
module.exports = Supplier;

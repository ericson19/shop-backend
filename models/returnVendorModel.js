const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Staff = require("./staffModel");
const Stock = require("./stockModel");
const Supplier = require("./supplierModel");
const Purchase = require("./purchaseModel");

const returnVendor = sequelize.define("returnVendor", {
  quantityReturned: {
    type: DataTypes.INTEGER,
    required: true,
  },
  amountRefunded: {
    type: DataTypes.FLOAT,
    required: true,
  },
  pricePerUnit: {
    type: DataTypes.FLOAT,
    required: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    required: true,
  },
  reason: {
    type: DataTypes.STRING,
    required: true,
    defaultValue: "No reason provided",
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stock,
      key: "id",
    },
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Staff,
      key: "id",
    },
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplier,
      key: "id",
    },
  },
  purchaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Purchase,
      key: "id",
    },
  },
});

returnVendor.belongsTo(Stock, { foreignKey: "stockId" });
Stock.hasMany(returnVendor, { foreignKey: "stockId" });

returnVendor.belongsTo(Staff, { foreignKey: "staffId" });
Staff.hasOne(returnVendor, { foreignKey: "staffId" });

returnVendor.belongsTo(Supplier, { foreignKey: "supplierId" });
Supplier.hasOne(returnVendor, { foreignKey: "supplierId" });

returnVendor.belongsTo(Purchase, { foreignKey: "purchaseId" });
Purchase.hasOne(returnVendor, { foreignKey: "purchaseId" });

module.exports = returnVendor;

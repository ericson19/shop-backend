const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Stock = require("./stockModel");
const Supplier = require("./supplierModel");
const Staff = require("./staffModel");

const Purchase = sequelize.define("Purchase", {
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amountRemaining: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending",
  },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "POS", "Bank_transfer"),
    allowNull: true,
    defaultValue: "cash",
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  purchasedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Staff,
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stock,
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
});
Purchase.belongsTo(Staff, { foreignKey: "purchasedBy" });
Staff.hasMany(Purchase, { foreignKey: "purchasedBy" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId" });
Supplier.hasMany(Purchase, { foreignKey: "supplierId" });
Purchase.belongsTo(Stock, { foreignKey: "productId" });
Stock.hasMany(Purchase, { foreignKey: "productId" });

module.exports = Purchase;

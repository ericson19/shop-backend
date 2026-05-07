const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Settings = sequelize.define(
  "Settings",
  {
    siteName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siteTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aboutUs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    siteFavicon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frontPicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    discountRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailHost: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    emailUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mailTrapToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paystackPublicKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paystackSecretKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "settings",
  },
);
module.exports = Settings;

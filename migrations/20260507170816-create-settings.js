"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      siteName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      siteUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      siteTitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      aboutUs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      siteFavicon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      frontPicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bankAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bankAccountName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      discountRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emailHost: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emailPort: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      emailUsername: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      emailPassword: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mailTrapToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paystackPublicKey: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paystackSecretKey: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("settings");
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("Settings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("Settings");
  },
};

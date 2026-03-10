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
    await queryInterface.createTable("Purchases", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      amountPaid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      amountRemaining: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      paymentStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      paymentMethod: {
        type: Sequelize.ENUM("cash", "POS", "Bank_transfer"),
        allowNull: true,
        defaultValue: "cash",
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      purchasedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Staffs",
          key: "id",
        },
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Stocks",
          key: "id",
        },
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "id",
        },
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
    await queryInterface.dropTable("Purchases");
  },
};

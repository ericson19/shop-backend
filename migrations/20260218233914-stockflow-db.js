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
    await queryInterface.createTable("StockFlows", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Stocks",
          key: "id",
        },
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      newStock: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      oldStock: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      inflowDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      movementType: {
        type: Sequelize.ENUM(
          "purchase",
          "return",
          "adjustment",
          "sold",
          "damage",
          "transfer-in",
          "transfer-out",
        ),
        allowNull: false,
      },
      flowType: {
        type: Sequelize.ENUM("in", "out"),
        allowNull: false,
      },

      doneBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Staffs",
          key: "id",
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
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
    await queryInterface.dropTable("StockFlows");
    await queryInterface.query(
      'DROP TYPE IF EXISTS "enum_StockFlows_movementType";',
    );
    await queryInterface.query(
      'DROP TYPE IF EXISTS "enum_StockFlows_flowType";',
    );
  },
};

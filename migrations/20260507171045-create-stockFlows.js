'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('stockFlows', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      stockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      movementType: {
        type: Sequelize.ENUM('purchase', 'return', 'adjustment', 'sold', 'damage', 'transfer-in', 'transfer-out'),
        allowNull: false,
      },
      flowType: {
        type: Sequelize.ENUM('in', 'out'),
        allowNull: false,
      },
      doneBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('stockFlows');
  }
};

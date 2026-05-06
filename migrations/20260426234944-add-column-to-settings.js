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
    await queryInterface.addColumn("Settings", "mailTrapToken", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Settings", "paystackPublicKey", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Settings", "paystackSecretKey", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Settings", "mailTrapToken");
    await queryInterface.removeColumn("Settings", "paystackPublicKey");
    await queryInterface.removeColumn("Settings", "paystackSecretKey");
  },
};

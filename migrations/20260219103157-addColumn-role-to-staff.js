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
    await queryInterface.addColumn("Staffs", "role", {
      type: Sequelize.ENUM("admin", "staff"),
      allowNull: false,
      defaultValue: "staff",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Staffs", "role");
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Staffs_role";
    `);
  },
};

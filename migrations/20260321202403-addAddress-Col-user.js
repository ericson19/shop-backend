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
    await queryInterface.addColumn("Users", "stateId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "States",
        key: "id",
      },
    });
    await queryInterface.addColumn("Users", "countryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Countries",
        key: "id",
      },
    });
    await queryInterface.addColumn("Users", "cityId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Cities",
        key: "id",
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
    await queryInterface.removeColumn("Users", "stateId");
    await queryInterface.removeColumn("Users", "countryId");
    await queryInterface.removeColumn("Users", "cityId");
  },
};

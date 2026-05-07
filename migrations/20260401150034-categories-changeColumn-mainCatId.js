"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Remove old foreign key
    await queryInterface.removeConstraint(
      "categories",
      "fk_categories_mainCat",
    );

    // 2️⃣ Change column
    await queryInterface.changeColumn("categories", "mainCatId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 3️⃣ Add new constraint correctly
    await queryInterface.addConstraint("categories", {
      fields: ["mainCatId"],
      type: "foreign key",
      name: "fk_categories_mainCat",
      references: {
        table: "maincategories",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  // async down(queryInterface, Sequelize) {
  //   await queryInterface.removeConstraint(
  //     "categories",
  //     "fk_categories_mainCat",
  //   );

  //   await queryInterface.changeColumn("categories", "mainCatId", {
  //     type: Sequelize.INTEGER,
  //     allowNull: false,
  //   });

  //   await queryInterface.addConstraint("categories", {
  //     fields: ["mainCatId"],
  //     type: "foreign key",
  //     name: "categories_mainCatId_foreign_idx",
  //     references: {
  //       table: "maincategories",
  //       field: "id",
  //     },
  //     onUpdate: "CASCADE",
  //     onDelete: "SET NULL",
  //   });
  // },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("reviews", {
      fields: ["movieId", "userId"],
      type: "unique",
      name: "unique_user_movie_review",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "reviews",
      "unique_user_movie_review"
    );
  },
};

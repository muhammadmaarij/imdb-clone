"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("movies", "reviewCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(`
      UPDATE movies m
      SET "reviewCount" = COALESCE(sub.cnt, 0)
      FROM (
        SELECT "movieId", COUNT(*)::integer AS cnt
        FROM reviews
        GROUP BY "movieId"
      ) sub
      WHERE m.id = sub."movieId"
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_movie_review_count()
      RETURNS TRIGGER AS $$
      DECLARE
        target_movie_id UUID;
      BEGIN
        IF TG_OP = 'INSERT' THEN
          target_movie_id := NEW."movieId";
        ELSIF TG_OP = 'DELETE' THEN
          target_movie_id := OLD."movieId";
        END IF;

        -- O(1): update only the affected movie's count
        UPDATE movies
        SET "reviewCount" = (
          SELECT COUNT(*)::integer FROM reviews WHERE "movieId" = target_movie_id
        )
        WHERE id = target_movie_id;

        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_review_insert
      AFTER INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_movie_review_count();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_review_delete
      AFTER DELETE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_movie_review_count();
    `);

    await queryInterface.addIndex("movies", ["reviewCount"], {
      name: "movies_review_count_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DROP TRIGGER IF EXISTS trg_review_insert ON reviews"
    );
    await queryInterface.sequelize.query(
      "DROP TRIGGER IF EXISTS trg_review_delete ON reviews"
    );
    await queryInterface.sequelize.query(
      "DROP FUNCTION IF EXISTS update_movie_review_count()"
    );
    await queryInterface.removeIndex("movies", "movies_review_count_idx");
    await queryInterface.removeColumn("movies", "reviewCount");
  },
};

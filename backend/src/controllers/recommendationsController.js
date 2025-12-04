const pool = require("../config/db");

const recommendationsController = {
  getRecommendations: async (req, res) => {
    try {
      const userId = req.user.userId;
      const personalizedLimit = 8;
      const popularLimit = 8;

      const favoriteCategories = await pool.query(
        `SELECT category_id, COUNT(*) as count
         FROM (
           SELECT b.category_id
           FROM borrows br
           JOIN books b ON br.book_id = b.id
           WHERE br.user_id = $1
           UNION ALL
           SELECT category_id
           FROM search_history
           WHERE user_id = $1 AND category_id IS NOT NULL
         ) as combined
         WHERE category_id IS NOT NULL
         GROUP BY category_id
         ORDER BY count DESC
         LIMIT 5`,
        [userId]
      );

      const borrowedBooks = await pool.query(
        "SELECT book_id FROM borrows WHERE user_id = $1",
        [userId]
      );

      const borrowedBookIds = borrowedBooks.rows.map((row) => row.book_id);

      let recommendations = [];

      if (favoriteCategories.rows.length > 0) {
        const categoryIds = favoriteCategories.rows.map(
          (row) => row.category_id
        );
        const params = [categoryIds, categoryIds[0], categoryIds];

        let query = `
          SELECT DISTINCT b.*, c.name as category_name,
          CASE 
            WHEN b.category_id = $2 THEN 3
            WHEN b.category_id = ANY($3::integer[]) THEN 2
            ELSE 1
          END as priority
          FROM books b
          LEFT JOIN categories c ON b.category_id = c.id
          WHERE b.category_id = ANY($1::integer[])
        `;

        if (borrowedBookIds.length > 0) {
          query += ` AND b.id NOT IN (SELECT unnest($${
            params.length + 1
          }::integer[]))`;
          params.push(borrowedBookIds);
        }

        query +=
          " ORDER BY priority DESC, b.title LIMIT $" + (params.length + 1);
        params.push(personalizedLimit);

        const result = await pool.query(query, params);
        recommendations = result.rows.map((book) => ({
          ...book,
          is_personalized: true,
        }));
      }

      // Always get popular books for the popular section
      let popularBooks = [];

        let query = `
          SELECT b.*, c.name as category_name,
          COUNT(br.id) as borrow_count
          FROM books b
          LEFT JOIN categories c ON b.category_id = c.id
          LEFT JOIN borrows br ON b.id = br.book_id
          WHERE 1=1
        `;

        const params = [];

        if (borrowedBookIds.length > 0) {
          query +=
            " AND b.id NOT IN (SELECT unnest($" +
            (params.length + 1) +
            "::integer[]))";
          params.push(borrowedBookIds);
        }

        if (recommendations.length > 0) {
          const recommendedIds = recommendations.map((r) => r.id);
          params.push(recommendedIds);
          query += ` AND b.id NOT IN (SELECT unnest($${params.length}::integer[]))`;
        }

        query += ` GROUP BY b.id, c.name
                   ORDER BY borrow_count DESC, b.title
                   LIMIT $${params.length + 1}`;
        params.push(popularLimit);

        const popularBooksResult = await pool.query(query, params);
        popularBooks = popularBooksResult.rows;

      const recentSearches = await pool.query(
        `SELECT DISTINCT ON (search_query) search_query, searched_at
         FROM search_history
         WHERE user_id = $1 AND search_query IS NOT NULL
         ORDER BY search_query, searched_at DESC
         LIMIT 10`,
        [userId]
      );

      // recommendations already contains personalized books
      const personalizedBooks = recommendations;

      res.json({
        sections: [
          {
            title: "แนะนำสำหรับคุณ",
            subtitle: "อิงจากหนังสือที่คุณยืมและค้นหา",
            books: personalizedBooks,
            type: "personalized",
          },
          {
            title: "หนังสือยอดนิยม",
            subtitle: "หนังสือที่ได้รับความนิยมจากผู้ใช้งานทั้งหมด",
            books: popularBooks,
            type: "popular",
          },
        ].filter((section) => section.books.length > 0),
        basedOn: {
          favoriteCategories: favoriteCategories.rows,
          recentSearches: recentSearches.rows.map((r) => r.search_query),
        },
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = recommendationsController;

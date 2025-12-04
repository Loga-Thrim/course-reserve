const pool = require('../config/db');

const booksController = {
  // Get all books with search and filter
  getAllBooks: async (req, res) => {
    try {
      const { search, category, page = 1, limit = 12 } = req.query;
      const userId = req.user?.userId;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT b.*, c.name as category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      // Search by title or author
      if (search) {
        paramCount++;
        query += ` AND (LOWER(b.title) LIKE LOWER($${paramCount}) OR LOWER(b.author) LIKE LOWER($${paramCount}))`;
        params.push(`%${search}%`);

        // Log search history if user is authenticated
        if (userId) {
          await pool.query(
            'INSERT INTO search_history (user_id, search_query) VALUES ($1, $2)',
            [userId, search]
          );
        }
      }

      // Filter by category
      if (category) {
        paramCount++;
        query += ` AND b.category_id = $${paramCount}`;
        params.push(category);

        // Log category search if user is authenticated
        if (userId) {
          await pool.query(
            'INSERT INTO search_history (user_id, category_id) VALUES ($1, $2)',
            [userId, category]
          );
        }
      }

      // Get total count for pagination (before adding ORDER BY)
      let countQuery = `SELECT COUNT(*) as total FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
      if (search) {
        countQuery += ` AND (LOWER(b.title) LIKE LOWER($1) OR LOWER(b.author) LIKE LOWER($1))`;
      }
      if (category) {
        const categoryParam = search ? 2 : 1;
        countQuery += ` AND b.category_id = $${categoryParam}`;
      }
      
      const totalResult = await pool.query(countQuery, params);
      const total = parseInt(totalResult.rows[0].total);
      
      // Add ORDER BY and pagination to main query
      query += ' ORDER BY b.title';
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limitNum, offset);

      const books = await pool.query(query, params);

      res.json({
        books: books.rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get single book by ID
  getBookById: async (req, res) => {
    try {
      const { id } = req.params;

      const book = await pool.query(
        `SELECT b.*, c.name as category_name
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.id = $1`,
        [id]
      );

      if (book.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(book.rows[0]);
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get all categories
  getCategories: async (req, res) => {
    try {
      const categories = await pool.query(
        'SELECT * FROM categories ORDER BY name'
      );

      res.json(categories.rows);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = booksController;

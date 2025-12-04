const pool = require('../../config/db');

const adminBooksController = {
  // Get all books with pagination
  getAllBooks: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', category = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT b.*, c.name as category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (LOWER(b.title) LIKE LOWER($${paramCount}) OR LOWER(b.author) LIKE LOWER($${paramCount}))`;
        params.push(`%${search}%`);
      }

      if (category) {
        paramCount++;
        query += ` AND b.category_id = $${paramCount}`;
        params.push(category);
      }

      // Get total count
      const countQuery = query.replace('SELECT b.*, c.name as category_name', 'SELECT COUNT(*) as total');
      const totalResult = await pool.query(countQuery, params);
      const total = parseInt(totalResult.rows[0].total);

      // Get paginated books
      query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const books = await pool.query(query, params);

      res.json({
        books: books.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create book
  createBook: async (req, res) => {
    try {
      const {
        title,
        author,
        category_id,
        description,
        cover_url,
        isbn,
        total_copies,
        published_year
      } = req.body;

      const result = await pool.query(
        `INSERT INTO books (title, author, category_id, description, cover_url, isbn, total_copies, available_copies, published_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
         RETURNING *`,
        [title, author, category_id, description, cover_url, isbn, total_copies, published_year]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Update book
  updateBook: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        author,
        category_id,
        description,
        cover_url,
        isbn,
        total_copies,
        available_copies,
        published_year
      } = req.body;

      const result = await pool.query(
        `UPDATE books 
         SET title = $1, author = $2, category_id = $3, description = $4, 
             cover_url = $5, isbn = $6, total_copies = $7, available_copies = $8, published_year = $9
         WHERE id = $10
         RETURNING *`,
        [title, author, category_id, description, cover_url, isbn, total_copies, available_copies, published_year, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Delete book
  deleteBook: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminBooksController;

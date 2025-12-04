const pool = require('../config/db');

const borrowsController = {
  // Borrow a book
  borrowBook: async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { bookId } = req.body;
      const userId = req.user.userId;

      // Check if book exists and is available
      const book = await client.query(
        'SELECT * FROM books WHERE id = $1',
        [bookId]
      );

      if (book.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Book not found' });
      }

      if (book.rows[0].available_copies <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Book is not available' });
      }

      // Check if user already borrowed this book and hasn't returned it
      const existingBorrow = await client.query(
        'SELECT * FROM borrows WHERE user_id = $1 AND book_id = $2 AND status = $3',
        [userId, bookId, 'borrowed']
      );

      if (existingBorrow.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'You have already borrowed this book' });
      }

      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create borrow record
      const borrow = await client.query(
        `INSERT INTO borrows (user_id, book_id, due_date, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, bookId, dueDate, 'borrowed']
      );

      // Update available copies
      await client.query(
        'UPDATE books SET available_copies = available_copies - 1 WHERE id = $1',
        [bookId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Book borrowed successfully',
        borrow: borrow.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Borrow book error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  },

  // Get user's borrowed books
  getUserBorrows: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status } = req.query;

      let query = `
        SELECT b.*, bk.title, bk.author, bk.cover_url, c.name as category_name
        FROM borrows b
        JOIN books bk ON b.book_id = bk.id
        LEFT JOIN categories c ON bk.category_id = c.id
        WHERE b.user_id = $1
      `;
      const params = [userId];

      if (status) {
        query += ' AND b.status = $2';
        params.push(status);
      }

      query += ' ORDER BY b.borrowed_at DESC';

      const borrows = await pool.query(query, params);

      res.json(borrows.rows);
    } catch (error) {
      console.error('Get borrows error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Return a book
  returnBook: async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const userId = req.user.userId;

      // Get borrow record
      const borrow = await client.query(
        'SELECT * FROM borrows WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (borrow.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Borrow record not found' });
      }

      if (borrow.rows[0].status === 'returned') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Book already returned' });
      }

      // Update borrow record
      await client.query(
        'UPDATE borrows SET status = $1, returned_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['returned', id]
      );

      // Update available copies
      await client.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1',
        [borrow.rows[0].book_id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Book returned successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Return book error:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }
};

module.exports = borrowsController;

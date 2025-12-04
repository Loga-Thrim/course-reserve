const pool = require('../../config/db');

const adminCourseReservesController = {
  // Get all reserves, optionally filtered by course_id
  getAllReserves: async (req, res) => {
    try {
      const { course_id } = req.query;

      let query = `
        SELECT cr.id, cr.course_id, cr.book_id, cr.created_at,
               c.name AS course_name,
               cu.name AS curriculum_name,
               cu.level AS curriculum_level,
               f.name AS faculty_name,
               b.title AS book_title,
               b.author AS book_author,
               b.isbn,
               cat.name AS category_name
        FROM course_reserves cr
        JOIN courses c ON cr.course_id = c.id
        JOIN curriculums cu ON c.curriculum_id = cu.id
        JOIN faculties f ON cu.faculty_id = f.id
        JOIN books b ON cr.book_id = b.id
        LEFT JOIN categories cat ON b.category_id = cat.id
      `;

      const params = [];
      if (course_id) {
        params.push(course_id);
        query += ' WHERE cr.course_id = $1';
      }

      query += ' ORDER BY cr.id';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get course reserves error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create reserve (link course and book)
  createReserve: async (req, res) => {
    try {
      const { course_id, book_id } = req.body;

      if (!course_id || !book_id) {
        return res.status(400).json({ error: 'course_id and book_id are required' });
      }

      const result = await pool.query(
        'INSERT INTO course_reserves (course_id, book_id) VALUES ($1, $2) RETURNING *',
        [course_id, book_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create course reserve error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid course_id or book_id' });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: 'This book is already reserved for this course' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Delete reserve
  deleteReserve: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM course_reserves WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course reserve not found' });
      }

      res.json({ message: 'Course reserve deleted successfully' });
    } catch (error) {
      console.error('Delete course reserve error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminCourseReservesController;

const pool = require('../../config/db');
const { psruAxios, PSRU_ENDPOINTS } = require('../../config/psruApi');

// Search books from library API
const searchLibraryBooks = async (keyword) => {
  try {
    const response = await psruAxios.get(`${PSRU_ENDPOINTS.BOOK_KEYWORD}/${encodeURIComponent(keyword)}`);

    if (response.data?.status === '200' && response.data?.message?.Display) {
      return response.data.message.Display;
    }
    return [];
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, error.message);
    return [];
  }
};

const adminCourseBooksController = {
  // Get all professor courses for admin
  getAllCourses: async (req, res) => {
    try {
      const { search } = req.query;

      let query = `
        SELECT pc.*, 
               COALESCE(
                 json_agg(
                   json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                 ) FILTER (WHERE ci.id IS NOT NULL), 
                 '[]'
               ) as instructors,
               (SELECT COUNT(*) FROM course_recommended_books crb WHERE crb.course_id = pc.id AND crb.admin_recommended = true) as admin_books_count
        FROM professor_courses pc
        LEFT JOIN course_instructors ci ON pc.id = ci.course_id
      `;

      const params = [];

      if (search) {
        params.push(`%${search}%`);
        query += ` WHERE pc.name_th ILIKE $1 OR pc.name_en ILIKE $1 OR pc.code_th ILIKE $1 OR pc.code_en ILIKE $1`;
      }

      query += ` GROUP BY pc.id ORDER BY pc.created_at DESC`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // Get recommended books for a course (admin view)
  getRecommendedBooks: async (req, res) => {
    try {
      const { courseId } = req.params;

      const result = await pool.query(
        `SELECT crb.*
         FROM course_recommended_books crb
         WHERE crb.course_id = $1
         ORDER BY crb.admin_recommended DESC, crb.created_at DESC`,
        [courseId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get recommended books error:', error);
      res.status(500).json({ error: 'Failed to fetch recommended books' });
    }
  },

  // Search books from library API
  searchBooks: async (req, res) => {
    try {
      const { keyword } = req.query;

      if (!keyword || keyword.trim().length < 2) {
        return res.status(400).json({ error: 'กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร' });
      }

      const books = await searchLibraryBooks(keyword.trim());

      res.json({
        keyword: keyword.trim(),
        books: books.map(book => ({
          id: book.Id,
          title: book.Title,
          author: book.Author,
          publisher: book.Publisher,
          callnumber: book.Callnumber,
          isbn: book.ISBNISSN,
          bookcover: book.Bookcover,
          mattypeName: book.MattypeName,
          lang: book.Lang,
          locations: book.Locations
        }))
      });
    } catch (error) {
      console.error('Search books error:', error);
      res.status(500).json({ error: 'Failed to search books' });
    }
  },

  // Add book recommendation (admin)
  addRecommendedBook: async (req, res) => {
    try {
      const { courseId } = req.params;
      const adminId = req.user.barcode;
      const { book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name, lang } = req.body;

      // Check if course exists
      const courseCheck = await pool.query(
        'SELECT id FROM professor_courses WHERE id = $1',
        [courseId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบรายวิชา' });
      }

      // Check if book already exists for this course
      const existingBook = await pool.query(
        'SELECT id FROM course_recommended_books WHERE course_id = $1 AND book_id = $2',
        [courseId, book_id]
      );

      if (existingBook.rows.length > 0) {
        // Update existing to be admin recommended
        const result = await pool.query(
          `UPDATE course_recommended_books 
           SET admin_recommended = true, added_by = $1
           WHERE course_id = $2 AND book_id = $3
           RETURNING *`,
          [adminId, courseId, book_id]
        );
        return res.json(result.rows[0]);
      }

      // Insert new book recommendation
      const result = await pool.query(
        `INSERT INTO course_recommended_books 
         (course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name, lang, admin_recommended, added_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
         RETURNING *`,
        [courseId, book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name || null, lang || null, adminId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Add recommended book error:', error);
      res.status(500).json({ error: 'Failed to add recommended book' });
    }
  },

  // Remove book recommendation (admin)
  removeRecommendedBook: async (req, res) => {
    try {
      const { courseId, bookId } = req.params;

      const result = await pool.query(
        'DELETE FROM course_recommended_books WHERE course_id = $1 AND id = $2 RETURNING *',
        [courseId, bookId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบหนังสือที่ต้องการลบ' });
      }

      res.json({ message: 'ลบหนังสือแนะนำเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Remove recommended book error:', error);
      res.status(500).json({ error: 'Failed to remove recommended book' });
    }
  },

  // Toggle admin recommended status
  toggleAdminRecommended: async (req, res) => {
    try {
      const { courseId, bookId } = req.params;
      const adminId = req.user.barcode;

      const result = await pool.query(
        `UPDATE course_recommended_books 
         SET admin_recommended = NOT admin_recommended, added_by = $1
         WHERE course_id = $2 AND id = $3
         RETURNING *`,
        [adminId, courseId, bookId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบหนังสือ' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Toggle admin recommended error:', error);
      res.status(500).json({ error: 'Failed to toggle admin recommended' });
    }
  }
};

module.exports = adminCourseBooksController;

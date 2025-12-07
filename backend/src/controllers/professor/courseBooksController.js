const pool = require('../../config/db');
const axios = require('axios');
const https = require('https');
const { extractKeywords } = require('../../services/bookRecommendationService');

const LIBRARY_API_URL = 'https://library.psru.ac.th/portal/lib_api/bookKeyword';
const LIBRARY_API_TOKEN = '12b5381c97af8dfce39652300b81db5e';

// Create axios instance that ignores SSL certificate errors (for library API)
const libraryApi = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Search books from library API
const searchLibraryBooks = async (keyword) => {
  try {
    const response = await libraryApi.get(`${LIBRARY_API_URL}/${encodeURIComponent(keyword)}`, {
      headers: {
        'token': LIBRARY_API_TOKEN
      },
      timeout: 10000
    });

    if (response.data?.status === '200' && response.data?.message?.Display) {
      return response.data.message.Display;
    }
    return [];
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, error.message);
    return [];
  }
};

const courseBooksController = {
  // Get courses that user can manage (is instructor - name must be in course_instructors)
  getMyCourses: async (req, res) => {
    try {
      const userName = req.user.name;

      const result = await pool.query(
        `SELECT pc.*, 
                COALESCE(
                  json_agg(
                    json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                  ) FILTER (WHERE ci.id IS NOT NULL), 
                  '[]'
                ) as instructors
         FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE EXISTS (
           SELECT 1 FROM course_instructors ci2 
           WHERE ci2.course_id = pc.id 
           AND LOWER(ci2.instructor_name) LIKE LOWER($1)
         )
         GROUP BY pc.id
         ORDER BY pc.created_at DESC`,
        [`%${userName}%`]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get my courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // Get book suggestions for a course from database (pre-fetched)
  getBookSuggestions: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userName = req.user.name;

      // Check if user is instructor of this course and get course details
      const courseCheck = await pool.query(
        `SELECT pc.id, pc.description_th, pc.description_en FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1 
           AND LOWER(ci.instructor_name) LIKE LOWER($2)`,
        [courseId, `%${userName}%`]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงรายวิชานี้' });
      }

      const course = courseCheck.rows[0];

      // Get recommended books from database
      const result = await pool.query(
        `SELECT DISTINCT book_id as id, title, author, publisher, callnumber, isbn, bookcover, 
                mattype_name as "mattypeName", lang, keyword_source
         FROM course_recommended_books 
         WHERE course_id = $1
         ORDER BY title`,
        [courseId]
      );

      // Extract all keywords from course description (not just ones with results)
      const allKeywords = extractKeywords(course.description_th, course.description_en);

      res.json({
        keywords: allKeywords,
        books: result.rows
      });
    } catch (error) {
      console.error('Get book suggestions error:', error);
      res.status(500).json({ error: 'Failed to get book suggestions' });
    }
  },

  // Refresh book recommendations for a course
  refreshBookSuggestions: async (req, res) => {
    try {
      const { courseId } = req.params;
      const userName = req.user.name;

      // Check if user is instructor of this course
      const courseCheck = await pool.query(
        `SELECT pc.* FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1 
           AND LOWER(ci.instructor_name) LIKE LOWER($2)`,
        [courseId, `%${userName}%`]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงรายวิชานี้' });
      }

      const course = courseCheck.rows[0];

      // Import and call the service
      const { fetchAndStoreRecommendedBooks } = require('../../services/bookRecommendationService');
      const result = await fetchAndStoreRecommendedBooks(parseInt(courseId), course.description_th, course.description_en);

      res.json({ 
        message: 'รีเฟรชหนังสือแนะนำเรียบร้อยแล้ว',
        keywords: result.keywords,
        booksAdded: result.booksAdded
      });
    } catch (error) {
      console.error('Refresh book suggestions error:', error);
      res.status(500).json({ error: 'Failed to refresh book suggestions' });
    }
  },

  // Search books by custom keyword
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

  // Get books added to a course
  getCourseBooks: async (req, res) => {
    try {
      const { courseId } = req.params;

      const result = await pool.query(
        `SELECT cb.*, u.name as added_by_name
         FROM course_books cb
         LEFT JOIN users u ON cb.added_by = u.id
         WHERE cb.course_id = $1
         ORDER BY cb.created_at DESC`,
        [courseId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get course books error:', error);
      res.status(500).json({ error: 'Failed to fetch course books' });
    }
  },

  // Add book to course
  addBookToCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const professorId = req.user.userId;
      const userName = req.user.name;
      const { book_id, title, author, publisher, callnumber, isbn, bookcover } = req.body;

      // Check if user is instructor of this course
      const courseCheck = await pool.query(
        `SELECT pc.id FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1 
           AND (pc.professor_id = $2 OR LOWER(ci.instructor_name) LIKE LOWER($3))`,
        [courseId, professorId, `%${userName}%`]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เพิ่มหนังสือในรายวิชานี้' });
      }

      // Check if book already added
      const existingBook = await pool.query(
        'SELECT id FROM course_books WHERE course_id = $1 AND book_id = $2',
        [courseId, book_id]
      );

      if (existingBook.rows.length > 0) {
        return res.status(400).json({ error: 'หนังสือนี้ถูกเพิ่มในรายวิชาแล้ว' });
      }

      const result = await pool.query(
        `INSERT INTO course_books (course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, added_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [courseId, book_id, title, author, publisher, callnumber, isbn, bookcover, professorId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Add book to course error:', error);
      res.status(500).json({ error: 'Failed to add book to course' });
    }
  },

  // Remove book from course
  removeBookFromCourse: async (req, res) => {
    try {
      const { courseId, bookId } = req.params;
      const professorId = req.user.userId;
      const userName = req.user.name;

      // Check if user is instructor of this course
      const courseCheck = await pool.query(
        `SELECT pc.id FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1 
           AND (pc.professor_id = $2 OR LOWER(ci.instructor_name) LIKE LOWER($3))`,
        [courseId, professorId, `%${userName}%`]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบหนังสือจากรายวิชานี้' });
      }

      const result = await pool.query(
        'DELETE FROM course_books WHERE course_id = $1 AND id = $2 RETURNING *',
        [courseId, bookId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบหนังสือที่ต้องการลบ' });
      }

      res.json({ message: 'ลบหนังสือออกจากรายวิชาเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Remove book from course error:', error);
      res.status(500).json({ error: 'Failed to remove book from course' });
    }
  }
};

module.exports = courseBooksController;

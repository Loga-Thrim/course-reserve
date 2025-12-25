const pool = require('../../config/db');
const { psruAxios, PSRU_ENDPOINTS } = require('../../config/psruApi');
const activityLogger = require('../../services/activityLogger');

const checkCourseAccess = async (courseId, user) => {
  const isAdmin = user.role === 'admin';
  
  if (isAdmin) {
    const result = await pool.query('SELECT * FROM professor_courses WHERE id = $1', [courseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  const professorId = user.barcode || user.id;
  const result = await pool.query(
    `SELECT pc.* FROM professor_courses pc
     LEFT JOIN course_instructors ci ON pc.id = ci.course_id
     WHERE pc.id = $1 
       AND (pc.professor_id = $2 OR LOWER(ci.instructor_name) LIKE LOWER($3))`,
    [courseId, professorId, `%${user.name}%`]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

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

const courseBooksController = {
  getMyCourses: async (req, res) => {
    try {
      const professorId = req.user.barcode || req.user.userId || req.user.id;
      const userName = req.user.name;
      const isAdmin = req.user.role === 'admin';

      let query = `
        SELECT pc.*, 
               COALESCE(
                 json_agg(
                   json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                 ) FILTER (WHERE ci.id IS NOT NULL), 
                 '[]'
               ) as instructors
        FROM professor_courses pc
        LEFT JOIN course_instructors ci ON pc.id = ci.course_id
      `;
      
      let params = [];
      
      if (!isAdmin) {
        query += `
          WHERE pc.professor_id = $1
             OR EXISTS (
               SELECT 1 FROM course_instructors ci2 
               WHERE ci2.course_id = pc.id 
               AND LOWER(ci2.instructor_name) LIKE LOWER($2)
             )
        `;
        params = [professorId, `%${userName}%`];
      }
      
      query += ` GROUP BY pc.id ORDER BY pc.created_at DESC`;
      
      const result = await pool.query(query, params);

      res.json(result.rows);
    } catch (error) {
      console.error('Get my courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  getBookSuggestions: async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await checkCourseAccess(courseId, req.user);
      if (!course) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงรายวิชานี้' });
      }

      const result = await pool.query(
        `SELECT DISTINCT ON (book_id) book_id as id, title, author, publisher, callnumber, isbn, bookcover, 
                mattype_name as "mattypeName", lang, keyword_source, admin_recommended, cat_date, created_at
         FROM course_recommended_books 
         WHERE course_id = $1
         ORDER BY book_id, created_at DESC`,
        [courseId]
      );
      
      // Sort by: 1) admin_recommended first, 2) cat_date desc (books with cat_date first, then by date), 3) created_at desc for books without cat_date
      result.rows.sort((a, b) => {
        // Admin recommended first
        if (a.admin_recommended !== b.admin_recommended) {
          return b.admin_recommended - a.admin_recommended;
        }
        
        // Both have cat_date - sort by cat_date desc
        if (a.cat_date && b.cat_date) {
          return new Date(b.cat_date) - new Date(a.cat_date);
        }
        
        // Only a has cat_date - a comes first
        if (a.cat_date && !b.cat_date) {
          return -1;
        }
        
        // Only b has cat_date - b comes first
        if (!a.cat_date && b.cat_date) {
          return 1;
        }
        
        // Neither has cat_date - sort by created_at desc
        return new Date(b.created_at) - new Date(a.created_at);
      });

      const courseKeywords = course.keywords || [];

      res.json({
        keywords: courseKeywords,
        books: result.rows
      });
    } catch (error) {
      console.error('Get book suggestions error:', error);
      res.status(500).json({ error: 'Failed to get book suggestions' });
    }
  },

  refreshBookSuggestions: async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await checkCourseAccess(courseId, req.user);
      if (!course) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงรายวิชานี้' });
      }

      const { fetchAndStoreRecommendedBooks } = require('../../services/bookRecommendationService');
      
      const keywordsToUse = course.keywords || [];
      
      if (keywordsToUse.length === 0) {
        return res.status(400).json({ 
          error: 'กรุณาเพิ่มคีย์เวิร์ดในรายวิชาก่อนดึงข้อมูลหนังสือ',
          keywords: []
        });
      }
      
      const result = await fetchAndStoreRecommendedBooks(parseInt(courseId), keywordsToUse);

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

  getCourseBooks: async (req, res) => {
    try {
      const { courseId } = req.params;

      const result = await pool.query(
        `SELECT cb.*
         FROM course_books cb
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

  addBookToCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { book_id, title, author, publisher, callnumber, isbn, bookcover } = req.body;

      const course = await checkCourseAccess(courseId, req.user);
      if (!course) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์เพิ่มหนังสือในรายวิชานี้' });
      }

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
        [courseId, book_id, title, author, publisher, callnumber, isbn, bookcover, req.user.barcode]
      );

      await activityLogger.logCreate(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'book',
        result.rows[0].id,
        title,
        { courseId, courseName: course.name_th, bookId: book_id },
        req
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Add book to course error:', error);
      res.status(500).json({ error: 'Failed to add book to course' });
    }
  },

  removeBookFromCourse: async (req, res) => {
    try {
      const { courseId, bookId } = req.params;

      const course = await checkCourseAccess(courseId, req.user);
      if (!course) {
        return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบหนังสือจากรายวิชานี้' });
      }

      const result = await pool.query(
        'DELETE FROM course_books WHERE course_id = $1 AND id = $2 RETURNING *',
        [courseId, bookId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบหนังสือที่ต้องการลบ' });
      }

      await activityLogger.logDelete(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'book',
        parseInt(bookId),
        result.rows[0].title,
        { courseId, courseName: course.name_th },
        req
      );

      res.json({ message: 'ลบหนังสือออกจากรายวิชาเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Remove book from course error:', error);
      res.status(500).json({ error: 'Failed to remove book from course' });
    }
  }
};

module.exports = courseBooksController;

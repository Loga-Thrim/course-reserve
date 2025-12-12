const pool = require('../config/db');

const courseBooksController = {
  // Get all curriculums with courses that have books
  getCurriculumsWithCourses: async (req, res) => {
    try {
      // Get unique curriculums from professor_courses that have books
      const result = await pool.query(`
        SELECT DISTINCT 
          pc.curriculum_th,
          pc.curriculum_en
        FROM professor_courses pc
        INNER JOIN course_books cb ON cb.course_id = pc.id
        WHERE pc.curriculum_th IS NOT NULL
        ORDER BY pc.curriculum_th
      `);

      // For each curriculum, get its courses that have books
      const curriculums = await Promise.all(
        result.rows.map(async (curriculum) => {
          const coursesResult = await pool.query(`
            SELECT DISTINCT 
              pc.id,
              pc.code_th,
              pc.code_en,
              pc.name_th,
              pc.name_en,
              (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count
            FROM professor_courses pc
            INNER JOIN course_books cb ON cb.course_id = pc.id
            WHERE pc.curriculum_th = $1
            ORDER BY pc.code_th
          `, [curriculum.curriculum_th]);

          return {
            curriculum_th: curriculum.curriculum_th,
            curriculum_en: curriculum.curriculum_en,
            courses: coursesResult.rows
          };
        })
      );

      res.json(curriculums);
    } catch (error) {
      console.error('Get curriculums with courses error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculums' });
    }
  },

  // Get books by curriculum or course
  getBooks: async (req, res) => {
    try {
      const { curriculum, courseId } = req.query;

      let query = `
        SELECT DISTINCT 
          cb.id,
          cb.book_id,
          cb.title,
          cb.author,
          cb.publisher,
          cb.callnumber,
          cb.isbn,
          cb.bookcover,
          pc.id as course_id,
          pc.code_th as course_code,
          pc.name_th as course_name,
          pc.curriculum_th
        FROM course_books cb
        INNER JOIN professor_courses pc ON pc.id = cb.course_id
        WHERE 1=1
      `;

      const params = [];

      if (courseId) {
        params.push(courseId);
        query += ` AND pc.id = $${params.length}`;
      } else if (curriculum) {
        params.push(curriculum);
        query += ` AND pc.curriculum_th = $${params.length}`;
      }

      query += ` ORDER BY cb.title`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }
};

module.exports = courseBooksController;

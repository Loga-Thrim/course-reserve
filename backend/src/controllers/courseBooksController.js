const pool = require('../config/db');

const courseBooksController = {
  // Get all curriculums with courses that have books (filtered by student's program)
  getCurriculumsWithCourses: async (req, res) => {
    try {
      // Get student's program from JWT token (e.g., "วิทยาการคอมพิวเตอร์")
      const studentProgram = req.user?.program;
      
      // Build query - filter by student's program if available
      let query = `
        SELECT DISTINCT 
          c.id as curriculum_id,
          c.name as curriculum_name,
          c.level as curriculum_level,
          f.id as faculty_id,
          f.name as faculty_name
        FROM professor_courses pc
        INNER JOIN course_books cb ON cb.course_id = pc.id
        INNER JOIN curriculums c ON pc.curriculum_id = c.id
        LEFT JOIN faculties f ON c.faculty_id = f.id
        WHERE pc.curriculum_id IS NOT NULL
      `;
      
      const params = [];
      
      // Filter by student's program - match curriculum name containing the program name
      if (studentProgram) {
        params.push(`%${studentProgram}%`);
        query += ` AND c.name ILIKE $${params.length}`;
      }
      
      query += ` ORDER BY c.name`;
      
      const result = await pool.query(query, params);

      // For each curriculum, get its courses that have books with full details
      const curriculums = await Promise.all(
        result.rows.map(async (curriculum) => {
          const coursesResult = await pool.query(`
            SELECT DISTINCT 
              pc.id,
              pc.code_th,
              pc.code_en,
              pc.name_th,
              pc.name_en,
              pc.description_th,
              pc.description_en,
              pc.website,
              (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
              (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = pc.id) as file_count,
              COALESCE(
                (SELECT STRING_AGG(ci.instructor_name, ', ') FROM course_instructors ci WHERE ci.course_id = pc.id),
                ''
              ) as instructors
            FROM professor_courses pc
            INNER JOIN course_books cb ON cb.course_id = pc.id
            WHERE pc.curriculum_id = $1
            ORDER BY pc.code_th
          `, [curriculum.curriculum_id]);

          return {
            curriculum_id: curriculum.curriculum_id,
            curriculum_name: curriculum.curriculum_name,
            curriculum_level: curriculum.curriculum_level,
            faculty_id: curriculum.faculty_id,
            faculty_name: curriculum.faculty_name,
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

  // Get course files for download
  getCourseFiles: async (req, res) => {
    try {
      const { courseId } = req.params;
      const studentProgram = req.user?.program;

      // Verify course belongs to student's program
      const courseCheck = await pool.query(`
        SELECT pc.id FROM professor_courses pc
        INNER JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE pc.id = $1 ${studentProgram ? `AND c.name ILIKE $2` : ''}
      `, studentProgram ? [courseId, `%${studentProgram}%`] : [courseId]);

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const result = await pool.query(
        `SELECT id, filename, original_name, file_type, file_size, created_at 
         FROM course_files WHERE course_id = $1 ORDER BY created_at DESC`,
        [courseId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get course files error:', error);
      res.status(500).json({ error: 'Failed to fetch course files' });
    }
  },

  // Get books by curriculum or course (filtered by student's program)
  getBooks: async (req, res) => {
    try {
      const { curriculumId, courseId } = req.query;
      const studentProgram = req.user?.program;

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
          c.name as curriculum_name
        FROM course_books cb
        INNER JOIN professor_courses pc ON pc.id = cb.course_id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE 1=1
      `;

      const params = [];

      // Filter by student's program if available
      if (studentProgram) {
        params.push(`%${studentProgram}%`);
        query += ` AND c.name ILIKE $${params.length}`;
      }

      if (courseId) {
        params.push(courseId);
        query += ` AND pc.id = $${params.length}`;
      } else if (curriculumId) {
        params.push(curriculumId);
        query += ` AND pc.curriculum_id = $${params.length}`;
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

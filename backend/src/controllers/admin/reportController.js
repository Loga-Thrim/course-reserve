const pool = require('../../config/db');

const reportController = {
  getOverviewStats: async (req, res) => {
    try {
      const coursesResult = await pool.query('SELECT COUNT(*) as total FROM professor_courses');
      const coursesWithBooksResult = await pool.query('SELECT COUNT(DISTINCT course_id) as total FROM course_books');
      const booksResult = await pool.query('SELECT COUNT(*) as total FROM course_books');
      const filesResult = await pool.query('SELECT COUNT(*) as total FROM course_files');
      const facultiesResult = await pool.query('SELECT COUNT(DISTINCT faculty_id) as total FROM professor_courses WHERE faculty_id IS NOT NULL');
      const curriculumsResult = await pool.query('SELECT COUNT(DISTINCT curriculum_id) as total FROM professor_courses WHERE curriculum_id IS NOT NULL');

      const coursesByMonthResult = await pool.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
        FROM professor_courses WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM') ORDER BY month DESC
      `);

      res.json({
        totalCourses: parseInt(coursesResult.rows[0].total),
        coursesWithBooks: parseInt(coursesWithBooksResult.rows[0].total),
        totalBooks: parseInt(booksResult.rows[0].total),
        totalFiles: parseInt(filesResult.rows[0].total),
        totalFaculties: parseInt(facultiesResult.rows[0].total),
        totalCurriculums: parseInt(curriculumsResult.rows[0].total),
        coursesByMonth: coursesByMonthResult.rows
      });
    } catch (error) {
      console.error('Get overview stats error:', error);
      res.status(500).json({ error: 'Failed to fetch overview stats' });
    }
  },

  getReportByFaculty: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT f.id as faculty_id, f.name as faculty_name,
          COUNT(DISTINCT pc.id) as course_count,
          COUNT(DISTINCT cb.id) as book_count,
          COUNT(DISTINCT cf.id) as file_count,
          COUNT(DISTINCT pc.curriculum_id) as curriculum_count
        FROM faculties f
        LEFT JOIN professor_courses pc ON pc.faculty_id = f.id
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        LEFT JOIN course_files cf ON cf.course_id = pc.id
        GROUP BY f.id, f.name ORDER BY course_count DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Get report by faculty error:', error);
      res.status(500).json({ error: 'Failed to fetch faculty report' });
    }
  },

  getReportByCurriculum: async (req, res) => {
    try {
      const { facultyId } = req.query;
      let query = `
        SELECT c.id as curriculum_id, c.name as curriculum_name, c.level as curriculum_level,
          f.name as faculty_name, COUNT(DISTINCT pc.id) as course_count,
          COUNT(DISTINCT cb.id) as book_count, COUNT(DISTINCT cf.id) as file_count
        FROM curriculums c
        LEFT JOIN faculties f ON c.faculty_id = f.id
        LEFT JOIN professor_courses pc ON pc.curriculum_id = c.id
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        LEFT JOIN course_files cf ON cf.course_id = pc.id
      `;
      const params = [];
      if (facultyId) {
        query += ' WHERE c.faculty_id = $1';
        params.push(facultyId);
      }
      query += ' GROUP BY c.id, c.name, c.level, f.name ORDER BY f.name, c.name';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get report by curriculum error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculum report' });
    }
  },

  getCourseReport: async (req, res) => {
    try {
      const { facultyId, curriculumId, hasBooks } = req.query;
      let query = `
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th, pc.name_en,
          pc.professor_id, pc.created_at,
          f.name as faculty_name, c.name as curriculum_name, c.level as curriculum_level,
          COUNT(DISTINCT cb.id) as book_count, COUNT(DISTINCT cf.id) as file_count,
          COALESCE(STRING_AGG(DISTINCT ci.instructor_name, ', '), '') as instructors
        FROM professor_courses pc
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        LEFT JOIN course_files cf ON cf.course_id = pc.id
        LEFT JOIN course_instructors ci ON ci.course_id = pc.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;
      if (facultyId) {
        query += ` AND pc.faculty_id = $${paramIndex}`;
        params.push(facultyId);
        paramIndex++;
      }
      if (curriculumId) {
        query += ` AND pc.curriculum_id = $${paramIndex}`;
        params.push(curriculumId);
        paramIndex++;
      }
      query += ` GROUP BY pc.id, pc.code_th, pc.code_en, pc.name_th, pc.name_en,
        pc.professor_id, pc.created_at, f.name, c.name, c.level`;
      if (hasBooks === 'true') {
        query += ' HAVING COUNT(DISTINCT cb.id) > 0';
      } else if (hasBooks === 'false') {
        query += ' HAVING COUNT(DISTINCT cb.id) = 0';
      }
      query += ' ORDER BY f.name, c.name, pc.code_th';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get course report error:', error);
      res.status(500).json({ error: 'Failed to fetch course report' });
    }
  },

  getBookReport: async (req, res) => {
    try {
      const { facultyId, curriculumId, courseId } = req.query;
      let query = `
        SELECT cb.id, cb.book_id, cb.title, cb.author, cb.publisher, cb.callnumber,
          cb.isbn, cb.created_at, pc.code_th as course_code, pc.name_th as course_name,
          f.name as faculty_name, c.name as curriculum_name
        FROM course_books cb
        INNER JOIN professor_courses pc ON pc.id = cb.course_id
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;
      if (facultyId) {
        query += ` AND pc.faculty_id = $${paramIndex}`;
        params.push(facultyId);
        paramIndex++;
      }
      if (curriculumId) {
        query += ` AND pc.curriculum_id = $${paramIndex}`;
        params.push(curriculumId);
        paramIndex++;
      }
      if (courseId) {
        query += ` AND pc.id = $${paramIndex}`;
        params.push(courseId);
        paramIndex++;
      }
      query += ' ORDER BY f.name, c.name, pc.code_th, cb.title';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get book report error:', error);
      res.status(500).json({ error: 'Failed to fetch book report' });
    }
  },

  getExportData: async (req, res) => {
    try {
      const { type } = req.query;
      let data = [];

      if (type === 'courses') {
        const result = await pool.query(`
          SELECT pc.code_th as "รหัสวิชา", pc.name_th as "ชื่อวิชา",
            pc.code_en as "Course Code", pc.name_en as "Course Name",
            f.name as "คณะ", c.name as "หลักสูตร", c.level as "ระดับ",
            COALESCE(STRING_AGG(DISTINCT ci.instructor_name, ', '), '-') as "ผู้สอน",
            COUNT(DISTINCT cb.id) as "จำนวนหนังสือ", COUNT(DISTINCT cf.id) as "จำนวนไฟล์",
            TO_CHAR(pc.created_at, 'DD/MM/YYYY') as "วันที่สร้าง"
          FROM professor_courses pc
          LEFT JOIN faculties f ON pc.faculty_id = f.id
          LEFT JOIN curriculums c ON pc.curriculum_id = c.id
          LEFT JOIN course_instructors ci ON ci.course_id = pc.id
          LEFT JOIN course_books cb ON cb.course_id = pc.id
          LEFT JOIN course_files cf ON cf.course_id = pc.id
          GROUP BY pc.id, pc.code_th, pc.name_th, pc.code_en, pc.name_en,
            pc.created_at, f.name, c.name, c.level
          ORDER BY f.name, c.name, pc.code_th
        `);
        data = result.rows;
      } else if (type === 'books') {
        const result = await pool.query(`
          SELECT cb.title as "ชื่อหนังสือ", cb.author as "ผู้แต่ง",
            cb.publisher as "สำนักพิมพ์", cb.callnumber as "เลขเรียกหนังสือ",
            cb.isbn as "ISBN", pc.code_th as "รหัสวิชา", pc.name_th as "ชื่อวิชา",
            f.name as "คณะ", c.name as "หลักสูตร",
            TO_CHAR(cb.created_at, 'DD/MM/YYYY') as "วันที่เพิ่ม"
          FROM course_books cb
          INNER JOIN professor_courses pc ON pc.id = cb.course_id
          LEFT JOIN faculties f ON pc.faculty_id = f.id
          LEFT JOIN curriculums c ON pc.curriculum_id = c.id
          ORDER BY f.name, c.name, pc.code_th, cb.title
        `);
        data = result.rows;
      } else if (type === 'faculty-summary') {
        const result = await pool.query(`
          SELECT f.name as "คณะ",
            COUNT(DISTINCT pc.id) as "จำนวนรายวิชา",
            COUNT(DISTINCT pc.curriculum_id) as "จำนวนหลักสูตร",
            COUNT(DISTINCT cb.id) as "จำนวนหนังสือ",
            COUNT(DISTINCT cf.id) as "จำนวนไฟล์"
          FROM faculties f
          LEFT JOIN professor_courses pc ON pc.faculty_id = f.id
          LEFT JOIN course_books cb ON cb.course_id = pc.id
          LEFT JOIN course_files cf ON cf.course_id = pc.id
          GROUP BY f.id, f.name ORDER BY f.name
        `);
        data = result.rows;
      } else if (type === 'curriculum-summary') {
        const result = await pool.query(`
          SELECT f.name as "คณะ", c.name as "หลักสูตร", c.level as "ระดับ",
            COUNT(DISTINCT pc.id) as "จำนวนรายวิชา",
            COUNT(DISTINCT cb.id) as "จำนวนหนังสือ",
            COUNT(DISTINCT cf.id) as "จำนวนไฟล์"
          FROM curriculums c
          LEFT JOIN faculties f ON c.faculty_id = f.id
          LEFT JOIN professor_courses pc ON pc.curriculum_id = c.id
          LEFT JOIN course_books cb ON cb.course_id = pc.id
          LEFT JOIN course_files cf ON cf.course_id = pc.id
          GROUP BY c.id, c.name, c.level, f.name ORDER BY f.name, c.name
        `);
        data = result.rows;
      }

      res.json(data);
    } catch (error) {
      console.error('Get export data error:', error);
      res.status(500).json({ error: 'Failed to fetch export data' });
    }
  }
};

module.exports = reportController;

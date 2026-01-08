const pool = require('../config/db');

const studentCoursesController = {
  // Get all available courses for students to browse
  getAllCourses: async (req, res) => {
    try {
      const { search, faculty_id, curriculum_id } = req.query;
      
      let query = `
        SELECT 
          pc.id,
          pc.code_th,
          pc.code_en,
          pc.name_th,
          pc.name_en,
          pc.description_th,
          pc.faculty_id,
          pc.curriculum_id,
          f.name as faculty_name,
          c.name as curriculum_name,
          COALESCE(
            (SELECT string_agg(ci.instructor_name, ', ') 
             FROM course_instructors ci 
             WHERE ci.course_id = pc.id), 
            ''
          ) as instructors,
          (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
          (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = pc.id) as file_count
        FROM professor_courses pc
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      if (search) {
        query += ` AND (
          pc.code_th ILIKE $${paramIndex} OR 
          pc.code_en ILIKE $${paramIndex} OR 
          pc.name_th ILIKE $${paramIndex} OR 
          pc.name_en ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      if (faculty_id) {
        query += ` AND pc.faculty_id = $${paramIndex}`;
        params.push(faculty_id);
        paramIndex++;
      }
      
      if (curriculum_id) {
        query += ` AND pc.curriculum_id = $${paramIndex}`;
        params.push(curriculum_id);
        paramIndex++;
      }
      
      query += ` ORDER BY pc.name_th`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get all courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // Get student's selected courses
  getMyCourses: async (req, res) => {
    try {
      const studentId = req.user.barcode || req.user.id || req.user.userId;
      
      const result = await pool.query(`
        SELECT 
          pc.id,
          pc.code_th,
          pc.code_en,
          pc.name_th,
          pc.name_en,
          pc.description_th,
          pc.faculty_id,
          pc.curriculum_id,
          f.name as faculty_name,
          c.name as curriculum_name,
          COALESCE(
            (SELECT string_agg(ci.instructor_name, ', ') 
             FROM course_instructors ci 
             WHERE ci.course_id = pc.id), 
            ''
          ) as instructors,
          (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
          (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = pc.id) as file_count
        FROM student_courses sc
        JOIN professor_courses pc ON sc.course_id = pc.id
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE sc.student_id = $1
        ORDER BY pc.name_th
      `, [studentId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Get my courses error:', error);
      res.status(500).json({ error: 'Failed to fetch your courses' });
    }
  },

  // Add course to student's list
  addCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user.barcode || req.user.id || req.user.userId;
      const studentName = req.user.name;
      const studentEmail = req.user.email || req.user.barcode;
      
      // Check if course exists
      const courseCheck = await pool.query(
        'SELECT id FROM professor_courses WHERE id = $1',
        [courseId]
      );
      
      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบรายวิชานี้' });
      }
      
      // Check if already added
      const existingCheck = await pool.query(
        'SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2',
        [studentId, courseId]
      );
      
      if (existingCheck.rows.length > 0) {
        return res.status(400).json({ error: 'คุณได้เพิ่มรายวิชานี้แล้ว' });
      }
      
      // Add course
      await pool.query(
        `INSERT INTO student_courses (student_id, student_name, student_email, course_id)
         VALUES ($1, $2, $3, $4)`,
        [studentId, studentName, studentEmail, courseId]
      );
      
      res.json({ message: 'เพิ่มรายวิชาเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Add course error:', error);
      res.status(500).json({ error: 'Failed to add course' });
    }
  },

  // Remove course from student's list
  removeCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user.barcode || req.user.id || req.user.userId;
      
      const result = await pool.query(
        'DELETE FROM student_courses WHERE student_id = $1 AND course_id = $2 RETURNING id',
        [studentId, courseId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบรายวิชานี้ในรายการของคุณ' });
      }
      
      res.json({ message: 'ลบรายวิชาเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Remove course error:', error);
      res.status(500).json({ error: 'Failed to remove course' });
    }
  },

  // Get course detail with books
  getCourseDetail: async (req, res) => {
    try {
      const { courseId } = req.params;
      
      // Get course info
      const courseResult = await pool.query(`
        SELECT 
          pc.id,
          pc.code_th,
          pc.code_en,
          pc.name_th,
          pc.name_en,
          pc.description_th,
          pc.description_en,
          pc.website,
          f.name as faculty_name,
          c.name as curriculum_name,
          COALESCE(
            (SELECT string_agg(ci.instructor_name, ', ') 
             FROM course_instructors ci 
             WHERE ci.course_id = pc.id), 
            ''
          ) as instructors
        FROM professor_courses pc
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        WHERE pc.id = $1
      `, [courseId]);
      
      if (courseResult.rows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบรายวิชา' });
      }
      
      // Get books
      const booksResult = await pool.query(`
        SELECT id, book_id, title, author, publisher, callnumber, isbn, bookcover
        FROM course_books
        WHERE course_id = $1
        ORDER BY created_at DESC
      `, [courseId]);
      
      // Get files
      const filesResult = await pool.query(`
        SELECT id, original_name, filename, file_type, file_size
        FROM course_files
        WHERE course_id = $1
        ORDER BY created_at DESC
      `, [courseId]);
      
      res.json({
        course: courseResult.rows[0],
        books: booksResult.rows,
        files: filesResult.rows
      });
    } catch (error) {
      console.error('Get course detail error:', error);
      res.status(500).json({ error: 'Failed to fetch course detail' });
    }
  },

  // Get faculties for filter
  getFaculties: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT f.id, f.name as name_th
        FROM faculties f
        JOIN professor_courses pc ON pc.faculty_id = f.id
        ORDER BY f.name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Get faculties error:', error);
      res.status(500).json({ error: 'Failed to fetch faculties' });
    }
  },

  // Get curriculums for filter
  getCurriculums: async (req, res) => {
    try {
      const { faculty_id } = req.query;
      
      let query = `
        SELECT DISTINCT c.id, c.name as name_th, c.faculty_id
        FROM curriculums c
        JOIN professor_courses pc ON pc.curriculum_id = c.id
      `;
      
      const params = [];
      if (faculty_id) {
        query += ` WHERE c.faculty_id = $1`;
        params.push(faculty_id);
      }
      
      query += ` ORDER BY c.name`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get curriculums error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculums' });
    }
  }
};

module.exports = studentCoursesController;

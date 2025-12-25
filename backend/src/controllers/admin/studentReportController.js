const pool = require('../../config/db');

const studentReportController = {
  // Get overview statistics
  getOverview: async (req, res) => {
    try {
      const stats = await pool.query(`
        SELECT 
          (SELECT COUNT(DISTINCT student_id) FROM student_courses) as total_students,
          (SELECT COUNT(*) FROM student_courses) as total_enrollments,
          (SELECT COUNT(DISTINCT course_id) FROM student_courses) as courses_with_students,
          (SELECT COUNT(*) FROM professor_courses) as total_courses
      `);

      // Get enrollments over time (last 30 days)
      const enrollmentTrend = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM student_courses
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      res.json({
        stats: stats.rows[0],
        enrollmentTrend: enrollmentTrend.rows
      });
    } catch (error) {
      console.error('Get student overview error:', error);
      res.status(500).json({ error: 'Failed to fetch overview' });
    }
  },

  // Get all student enrollments
  getEnrollments: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, course_id, faculty_id } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          sc.id,
          sc.student_id,
          sc.student_name,
          sc.student_email,
          sc.created_at,
          pc.id as course_id,
          pc.code_th as course_code,
          pc.name_th as course_name,
          f.name as faculty_name
        FROM student_courses sc
        JOIN professor_courses pc ON sc.course_id = pc.id
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (
          sc.student_id ILIKE $${paramIndex} OR 
          sc.student_name ILIKE $${paramIndex} OR
          pc.code_th ILIKE $${paramIndex} OR
          pc.name_th ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (course_id) {
        query += ` AND sc.course_id = $${paramIndex}`;
        params.push(course_id);
        paramIndex++;
      }

      if (faculty_id) {
        query += ` AND pc.faculty_id = $${paramIndex}`;
        params.push(faculty_id);
        paramIndex++;
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) FROM'
      );
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY sc.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  },

  // Get popular courses (most enrolled)
  getPopularCourses: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const result = await pool.query(`
        SELECT 
          pc.id,
          pc.code_th,
          pc.name_th,
          f.name as faculty_name,
          COUNT(sc.id) as student_count,
          (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count
        FROM professor_courses pc
        LEFT JOIN student_courses sc ON pc.id = sc.course_id
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        GROUP BY pc.id, pc.code_th, pc.name_th, f.name
        HAVING COUNT(sc.id) > 0
        ORDER BY student_count DESC
        LIMIT $1
      `, [limit]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get popular courses error:', error);
      res.status(500).json({ error: 'Failed to fetch popular courses' });
    }
  },

  // Get active students (most enrollments)
  getActiveStudents: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const result = await pool.query(`
        SELECT 
          sc.student_id,
          sc.student_name,
          sc.student_email,
          COUNT(sc.id) as course_count,
          MIN(sc.created_at) as first_enrollment,
          MAX(sc.created_at) as last_enrollment
        FROM student_courses sc
        GROUP BY sc.student_id, sc.student_name, sc.student_email
        ORDER BY course_count DESC
        LIMIT $1
      `, [limit]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get active students error:', error);
      res.status(500).json({ error: 'Failed to fetch active students' });
    }
  },

  // Get enrollment by faculty
  getEnrollmentByFaculty: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          f.id,
          f.name as faculty_name,
          COUNT(DISTINCT sc.student_id) as student_count,
          COUNT(sc.id) as enrollment_count,
          COUNT(DISTINCT sc.course_id) as course_count
        FROM faculties f
        JOIN professor_courses pc ON pc.faculty_id = f.id
        LEFT JOIN student_courses sc ON sc.course_id = pc.id
        GROUP BY f.id, f.name
        ORDER BY enrollment_count DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Get enrollment by faculty error:', error);
      res.status(500).json({ error: 'Failed to fetch faculty stats' });
    }
  },

  // Get courses without students
  getCoursesWithoutStudents: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          pc.id,
          pc.code_th,
          pc.name_th,
          f.name as faculty_name,
          (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
          pc.created_at
        FROM professor_courses pc
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        WHERE NOT EXISTS (
          SELECT 1 FROM student_courses sc WHERE sc.course_id = pc.id
        )
        ORDER BY pc.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Get courses without students error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // Export student enrollments
  exportEnrollments: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          sc.student_id as "รหัสนักศึกษา",
          sc.student_name as "ชื่อนักศึกษา",
          sc.student_email as "อีเมล",
          pc.code_th as "รหัสวิชา",
          pc.name_th as "ชื่อวิชา",
          f.name as "คณะ",
          TO_CHAR(sc.created_at, 'DD/MM/YYYY HH24:MI') as "วันที่เพิ่ม"
        FROM student_courses sc
        JOIN professor_courses pc ON sc.course_id = pc.id
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        ORDER BY sc.created_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Export enrollments error:', error);
      res.status(500).json({ error: 'Failed to export' });
    }
  }
};

module.exports = studentReportController;

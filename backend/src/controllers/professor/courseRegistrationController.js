const pool = require('../../config/db');
const { fetchAndStoreRecommendedBooks } = require('../../services/bookRecommendationService');
const activityLogger = require('../../services/activityLogger');

// Helper function to check if user has access to a course
const checkCourseAccess = async (client, courseId, user) => {
  const isAdmin = user.role === 'admin';
  
  // Admin has access to all courses
  if (isAdmin) {
    const result = await client.query('SELECT * FROM professor_courses WHERE id = $1', [courseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  // Professor: check by professor_id OR instructor name
  const professorId = user.barcode || user.id; // barcode for PSRU auth, id for self-auth
  const result = await client.query(
    `SELECT pc.* FROM professor_courses pc
     LEFT JOIN course_instructors ci ON pc.id = ci.course_id
     WHERE pc.id = $1 
       AND (pc.professor_id = $2 OR LOWER(ci.instructor_name) LIKE LOWER($3))`,
    [courseId, professorId, `%${user.name}%`]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

const courseRegistrationController = {
  // Get all faculties
  getFaculties: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name FROM faculties ORDER BY name`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get faculties error:', error);
      res.status(500).json({ error: 'Failed to fetch faculties' });
    }
  },

  // Get curriculums by faculty
  getCurriculums: async (req, res) => {
    try {
      const { faculty_id } = req.query;
      
      let query = `
        SELECT c.id, c.name, c.level, c.faculty_id, f.name as faculty_name
        FROM curriculums c
        JOIN faculties f ON c.faculty_id = f.id
      `;
      const params = [];
      
      if (faculty_id) {
        params.push(faculty_id);
        query += ' WHERE c.faculty_id = $1';
      }
      
      query += ' ORDER BY c.name';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get curriculums error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculums' });
    }
  },

  // Get all courses where user is creator OR instructor (admin sees all)
  getAllCourses: async (req, res) => {
    try {
      const professorId = req.user.barcode || req.user.userId || req.user.id; // barcode for PSRU auth, userId/id for self-auth
      const userName = req.user.name;
      const isAdmin = req.user.role === 'admin';
      
      let query = `
        SELECT pc.*, 
               f.name as faculty_name,
               c.name as curriculum_name,
               c.level as curriculum_level,
               COALESCE(
                 json_agg(
                   json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                 ) FILTER (WHERE ci.id IS NOT NULL), 
                 '[]'
               ) as instructors
        FROM professor_courses pc
        LEFT JOIN faculties f ON pc.faculty_id = f.id
        LEFT JOIN curriculums c ON pc.curriculum_id = c.id
        LEFT JOIN course_instructors ci ON pc.id = ci.course_id
      `;
      
      let params = [];
      
      // Admin sees all courses, professor sees only their own
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
      
      query += ` GROUP BY pc.id, f.name, c.name, c.level ORDER BY pc.created_at DESC`;
      
      const result = await pool.query(query, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Get professor courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  // Create a new course
  createCourse: async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const professorId = req.user.barcode;
      const {
        name_th,
        name_en,
        code_th,
        code_en,
        faculty_id,
        curriculum_id,
        description_th,
        description_en,
        website,
        instructors,
        keywords
      } = req.body;

      // Validate required fields
      if (!name_th || !code_th || !faculty_id || !curriculum_id || !description_th) {
        return res.status(400).json({ 
          error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' 
        });
      }

      // Validate at least one instructor
      const validInstructors = instructors?.filter(i => i.trim()) || [];
      if (validInstructors.length === 0) {
        return res.status(400).json({ 
          error: 'กรุณาระบุอาจารย์ผู้สอนอย่างน้อย 1 คน' 
        });
      }

      const result = await client.query(
        `INSERT INTO professor_courses 
         (professor_id, name_th, name_en, code_th, code_en, faculty_id, curriculum_id, 
          description_th, description_en, website, keywords) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [professorId, name_th, name_en || null, code_th, code_en || null, faculty_id, curriculum_id, 
         description_th, description_en || null, website || null, keywords || []]
      );

      const courseId = result.rows[0].id;

      // Insert instructors
      for (const instructor of validInstructors) {
        await client.query(
          `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
          [courseId, instructor.trim()]
        );
      }

      await client.query('COMMIT');

      // Fetch recommended books in background using keywords
      const keywordsToUse = keywords || [];
      if (keywordsToUse.length > 0) {
        fetchAndStoreRecommendedBooks(courseId, keywordsToUse)
          .then(() => console.log(`Recommended books fetched for course ${courseId}`))
          .catch(err => console.error(`Error fetching recommended books for course ${courseId}:`, err));
      }

      // Fetch the course with instructors
      const courseWithInstructors = await pool.query(
        `SELECT pc.*, 
                COALESCE(
                  json_agg(
                    json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                  ) FILTER (WHERE ci.id IS NOT NULL), 
                  '[]'
                ) as instructors
         FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1
         GROUP BY pc.id`,
        [courseId]
      );

      // Log activity
      await activityLogger.logCreate(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'course',
        courseId,
        `${code_th} - ${name_th}`,
        { instructors: validInstructors, keywords },
        req
      );

      res.status(201).json(courseWithInstructors.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    } finally {
      client.release();
    }
  },

  // Update a course
  updateCourse: async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const {
        name_th,
        name_en,
        code_th,
        code_en,
        faculty_id,
        curriculum_id,
        description_th,
        description_en,
        website,
        instructors,
        keywords
      } = req.body;

      // Check if user has access to this course (admin or owner/instructor)
      const course = await checkCourseAccess(client, id, req.user);
      if (!course) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      // Validate at least one instructor
      const validInstructors = instructors?.filter(i => i.trim()) || [];
      if (validInstructors.length === 0) {
        return res.status(400).json({ 
          error: 'กรุณาระบุอาจารย์ผู้สอนอย่างน้อย 1 คน' 
        });
      }

      const result = await client.query(
        `UPDATE professor_courses 
         SET name_th = $1, name_en = $2, code_th = $3, code_en = $4,
             faculty_id = $5, curriculum_id = $6, 
             description_th = $7, description_en = $8, website = $9, keywords = $10, updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
        [name_th, name_en || null, code_th, code_en || null, faculty_id, curriculum_id,
         description_th, description_en || null, website || null, keywords || [], id]
      );

      // Delete existing instructors and re-insert
      await client.query('DELETE FROM course_instructors WHERE course_id = $1', [id]);

      // Insert new instructors
      for (const instructor of validInstructors) {
        await client.query(
          `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
          [id, instructor.trim()]
        );
      }

      await client.query('COMMIT');

      // Fetch recommended books in background using keywords
      const keywordsToUse = keywords || [];
      if (keywordsToUse.length > 0) {
        fetchAndStoreRecommendedBooks(parseInt(id), keywordsToUse)
          .then(() => console.log(`Recommended books updated for course ${id}`))
          .catch(err => console.error(`Error updating recommended books for course ${id}:`, err));
      }

      // Fetch the course with instructors
      const courseWithInstructors = await pool.query(
        `SELECT pc.*, 
                COALESCE(
                  json_agg(
                    json_build_object('id', ci.id, 'instructor_name', ci.instructor_name)
                  ) FILTER (WHERE ci.id IS NOT NULL), 
                  '[]'
                ) as instructors
         FROM professor_courses pc
         LEFT JOIN course_instructors ci ON pc.id = ci.course_id
         WHERE pc.id = $1
         GROUP BY pc.id`,
        [id]
      );

      // Log activity
      await activityLogger.logUpdate(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'course',
        parseInt(id),
        `${code_th} - ${name_th}`,
        { instructors: validInstructors, keywords },
        req
      );

      res.json(courseWithInstructors.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
    } finally {
      client.release();
    }
  },

  // Delete a course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user has access to this course (admin or owner/instructor)
      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      // Log activity before deletion
      await activityLogger.logDelete(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'course',
        parseInt(id),
        `${course.code_th} - ${course.name_th}`,
        {},
        req
      );

      await pool.query('DELETE FROM professor_courses WHERE id = $1', [id]);

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  },

  // Get files for a course
  getCourseFiles: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user has access to this course (admin or owner/instructor)
      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const result = await pool.query(
        `SELECT id, filename, original_name, file_type, file_size, created_at 
         FROM course_files WHERE course_id = $1 ORDER BY created_at DESC`,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get course files error:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  },

  // Upload file to a course
  uploadCourseFile: async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
      }

      // Check if user has access to this course (admin or owner/instructor)
      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const { filename, originalname, mimetype, size, path: filePath } = req.file;

      const result = await pool.query(
        `INSERT INTO course_files (course_id, filename, original_name, file_type, file_size, file_path, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, filename, original_name, file_type, file_size, created_at`,
        [id, filename, originalname, mimetype, size, filePath, req.user.barcode]
      );

      // Log activity
      await activityLogger.logCreate(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'file',
        result.rows[0].id,
        originalname,
        { courseId: id, courseName: course.name_th, fileSize: size, fileType: mimetype },
        req
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  // Delete a file
  deleteCourseFile: async (req, res) => {
    const fs = require('fs');
    try {
      const { id, fileId } = req.params;

      // Check if user has access to this course (admin or owner/instructor)
      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      // Get file info and delete
      const fileResult = await pool.query(
        'DELETE FROM course_files WHERE id = $1 AND course_id = $2 RETURNING file_path, original_name',
        [fileId, id]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Log activity
      await activityLogger.logDelete(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'file',
        parseInt(fileId),
        fileResult.rows[0].original_name,
        { courseId: id, courseName: course.name_th },
        req
      );

      // Delete physical file
      const filePath = fileResult.rows[0].file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  },

  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const professorId = req.user.barcode || req.user.userId || req.user.id;
      const userName = req.user.name;
      const isAdmin = req.user.role === 'admin';

      let courseFilter = '';
      let params = [];

      if (!isAdmin) {
        courseFilter = `WHERE pc.professor_id = $1 
          OR EXISTS (
            SELECT 1 FROM course_instructors ci2 
            WHERE ci2.course_id = pc.id 
            AND LOWER(ci2.instructor_name) LIKE LOWER($2)
          )`;
        params = [professorId, `%${userName}%`];
      }

      // Get total courses count
      const coursesResult = await pool.query(`
        SELECT COUNT(*) as total FROM professor_courses pc ${courseFilter}
      `, params);

      // Get courses with books count
      const coursesWithBooksResult = await pool.query(`
        SELECT COUNT(DISTINCT pc.id) as total 
        FROM professor_courses pc
        INNER JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter ? courseFilter.replace('WHERE', isAdmin ? 'WHERE 1=1 AND' : 'WHERE') : ''}
      `, params);

      // Get total books added count
      const booksResult = await pool.query(`
        SELECT COUNT(*) as total 
        FROM course_books cb
        INNER JOIN professor_courses pc ON pc.id = cb.course_id
        ${courseFilter}
      `, params);

      // Get total files uploaded count
      const filesResult = await pool.query(`
        SELECT COUNT(*) as total 
        FROM course_files cf
        INNER JOIN professor_courses pc ON pc.id = cf.course_id
        ${courseFilter}
      `, params);

      // Get recent courses (last 5)
      const recentCoursesResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.name_th, pc.created_at,
               (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
               (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = pc.id) as file_count
        FROM professor_courses pc
        ${courseFilter}
        ORDER BY pc.created_at DESC
        LIMIT 5
      `, params);

      // Get courses needing books (courses with 0 books)
      const coursesNeedingBooksResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.name_th
        FROM professor_courses pc
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter}
        GROUP BY pc.id
        HAVING COUNT(cb.id) = 0
        ORDER BY pc.created_at DESC
        LIMIT 5
      `, params);

      res.json({
        totalCourses: parseInt(coursesResult.rows[0].total),
        coursesWithBooks: parseInt(coursesWithBooksResult.rows[0].total),
        totalBooks: parseInt(booksResult.rows[0].total),
        totalFiles: parseInt(filesResult.rows[0].total),
        recentCourses: recentCoursesResult.rows,
        coursesNeedingBooks: coursesNeedingBooksResult.rows
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
};

module.exports = courseRegistrationController;

const pool = require('../../config/db');
const { fetchAndStoreRecommendedBooks } = require('../../services/bookRecommendationService');
const activityLogger = require('../../services/activityLogger');

const checkCourseAccess = async (client, courseId, user) => {
  const isAdmin = user.role === 'admin';
  
  if (isAdmin) {
    const result = await client.query('SELECT * FROM professor_courses WHERE id = $1', [courseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  const professorId = user.barcode || user.id;
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

  getAllCourses: async (req, res) => {
    try {
      const professorId = req.user.barcode || req.user.userId || req.user.id;
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

      if (!name_th || !faculty_id || !curriculum_id || !description_th) {
        return res.status(400).json({ 
          error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' 
        });
      }

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
        [professorId, name_th, name_en || null, code_th || null, code_en || null, faculty_id, curriculum_id, 
         description_th, description_en || null, website || null, keywords || []]
      );

      const courseId = result.rows[0].id;

      for (const instructor of validInstructors) {
        await client.query(
          `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
          [courseId, instructor.trim()]
        );
      }

      await client.query('COMMIT');

      const keywordsToUse = keywords || [];
      if (keywordsToUse.length > 0) {
        fetchAndStoreRecommendedBooks(courseId, keywordsToUse)
          .catch(err => console.error(`Error fetching recommended books for course ${courseId}:`, err));
      }

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

      const course = await checkCourseAccess(client, id, req.user);
      if (!course) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

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
        [name_th, name_en || null, code_th || null, code_en || null, faculty_id, curriculum_id,
         description_th, description_en || null, website || null, keywords || [], id]
      );

      await client.query('DELETE FROM course_instructors WHERE course_id = $1', [id]);

      for (const instructor of validInstructors) {
        await client.query(
          `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
          [id, instructor.trim()]
        );
      }

      await client.query('COMMIT');

      const keywordsToUse = keywords || [];
      if (keywordsToUse.length > 0) {
        fetchAndStoreRecommendedBooks(parseInt(id), keywordsToUse)
          .catch(err => console.error(`Error updating recommended books for course ${id}:`, err));
      }

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

  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

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

  getCourseFiles: async (req, res) => {
    try {
      const { id } = req.params;

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

  uploadCourseFile: async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
      }

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

  deleteCourseFile: async (req, res) => {
    const fs = require('fs');
    try {
      const { id, fileId } = req.params;

      const course = await checkCourseAccess(pool, id, req.user);
      if (!course) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const fileResult = await pool.query(
        'DELETE FROM course_files WHERE id = $1 AND course_id = $2 RETURNING file_path, original_name',
        [fileId, id]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      await activityLogger.logDelete(
        { id: req.user.userId || req.user.id, name: req.user.name, email: req.user.barcode },
        'professor',
        'file',
        parseInt(fileId),
        fileResult.rows[0].original_name,
        { courseId: id, courseName: course.name_th },
        req
      );

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

      const coursesResult = await pool.query(`
        SELECT COUNT(*) as total FROM professor_courses pc ${courseFilter}
      `, params);

      const coursesWithBooksResult = await pool.query(`
        SELECT COUNT(DISTINCT pc.id) as total 
        FROM professor_courses pc
        INNER JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter ? courseFilter.replace('WHERE', isAdmin ? 'WHERE 1=1 AND' : 'WHERE') : ''}
      `, params);

      const booksResult = await pool.query(`
        SELECT COUNT(*) as total 
        FROM course_books cb
        INNER JOIN professor_courses pc ON pc.id = cb.course_id
        ${courseFilter}
      `, params);

      const filesResult = await pool.query(`
        SELECT COUNT(*) as total 
        FROM course_files cf
        INNER JOIN professor_courses pc ON pc.id = cf.course_id
        ${courseFilter}
      `, params);

      const recentCoursesResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th, pc.created_at,
               (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count,
               (SELECT COUNT(*) FROM course_files cf WHERE cf.course_id = pc.id) as file_count
        FROM professor_courses pc
        ${courseFilter}
        ORDER BY pc.created_at DESC
        LIMIT 5
      `, params);

      const allCoursesResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th,
               (SELECT COUNT(*) FROM course_books cb WHERE cb.course_id = pc.id) as book_count
        FROM professor_courses pc
        ${courseFilter}
        ORDER BY pc.name_th
      `, params);

      const coursesWithBooksListResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th,
               COUNT(cb.id) as book_count
        FROM professor_courses pc
        INNER JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter ? courseFilter.replace('WHERE', isAdmin ? 'WHERE 1=1 AND' : 'WHERE') : ''}
        GROUP BY pc.id
        ORDER BY pc.name_th
      `, params);

      const coursesNeedingBooksResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th
        FROM professor_courses pc
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter}
        GROUP BY pc.id
        HAVING COUNT(cb.id) = 0
        ORDER BY pc.created_at DESC
        LIMIT 5
      `, params);

      const bookCountByCoursesResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th, COUNT(cb.id) as book_count
        FROM professor_courses pc
        LEFT JOIN course_books cb ON cb.course_id = pc.id
        ${courseFilter}
        GROUP BY pc.id
        ORDER BY book_count DESC, pc.name_th
      `, params);

      const fileCountByCoursesResult = await pool.query(`
        SELECT pc.id, pc.code_th, pc.code_en, pc.name_th, COUNT(cf.id) as file_count
        FROM professor_courses pc
        LEFT JOIN course_files cf ON cf.course_id = pc.id
        ${courseFilter}
        GROUP BY pc.id
        ORDER BY file_count DESC, pc.name_th
      `, params);

      res.json({
        totalCourses: parseInt(coursesResult.rows[0].total),
        coursesWithBooks: parseInt(coursesWithBooksResult.rows[0].total),
        totalBooks: parseInt(booksResult.rows[0].total),
        totalFiles: parseInt(filesResult.rows[0].total),
        recentCourses: recentCoursesResult.rows,
        coursesNeedingBooks: coursesNeedingBooksResult.rows,
        allCourses: allCoursesResult.rows,
        coursesWithBooksList: coursesWithBooksListResult.rows,
        bookCountByCourses: bookCountByCoursesResult.rows,
        fileCountByCourses: fileCountByCoursesResult.rows
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
};

module.exports = courseRegistrationController;

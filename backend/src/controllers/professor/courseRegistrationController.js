const pool = require('../../config/db');
const { fetchAndStoreRecommendedBooks } = require('../../services/bookRecommendationService');

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

  // Get all courses where user is creator OR instructor
  getAllCourses: async (req, res) => {
    try {
      const professorId = req.user.userId;
      const userName = req.user.name;
      
      const result = await pool.query(
        `SELECT pc.*, 
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
         WHERE pc.professor_id = $1 
            OR EXISTS (
              SELECT 1 FROM course_instructors ci2 
              WHERE ci2.course_id = pc.id 
              AND LOWER(ci2.instructor_name) LIKE LOWER($2)
            )
         GROUP BY pc.id, f.name, c.name, c.level
         ORDER BY pc.created_at DESC`,
        [professorId, `%${userName}%`]
      );
      
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
      
      const professorId = req.user.userId;
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
      
      const professorId = req.user.userId;
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

      // Check if course belongs to this professor
      const checkCourse = await client.query(
        'SELECT * FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (checkCourse.rows.length === 0) {
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
         WHERE id = $11 AND professor_id = $12
         RETURNING *`,
        [name_th, name_en || null, code_th, code_en || null, faculty_id, curriculum_id,
         description_th, description_en || null, website || null, keywords || [], id, professorId]
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
      const professorId = req.user.userId;
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM professor_courses WHERE id = $1 AND professor_id = $2 RETURNING *',
        [id, professorId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  },

  // Get files for a course
  getCourseFiles: async (req, res) => {
    try {
      const professorId = req.user.userId;
      const { id } = req.params;

      // Verify course belongs to professor
      const courseCheck = await pool.query(
        'SELECT id FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (courseCheck.rows.length === 0) {
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
      const professorId = req.user.userId;
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
      }

      // Verify course belongs to professor
      const courseCheck = await pool.query(
        'SELECT id FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const { filename, originalname, mimetype, size, path: filePath } = req.file;

      const result = await pool.query(
        `INSERT INTO course_files (course_id, filename, original_name, file_type, file_size, file_path, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, filename, original_name, file_type, file_size, created_at`,
        [id, filename, originalname, mimetype, size, filePath, professorId]
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
      const professorId = req.user.userId;
      const { id, fileId } = req.params;

      // Verify course belongs to professor
      const courseCheck = await pool.query(
        'SELECT id FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      // Get file info and delete
      const fileResult = await pool.query(
        'DELETE FROM course_files WHERE id = $1 AND course_id = $2 RETURNING file_path',
        [fileId, id]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

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
  }
};

module.exports = courseRegistrationController;

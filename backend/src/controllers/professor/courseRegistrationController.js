const pool = require('../../config/db');

const courseRegistrationController = {
  // Get distinct curriculum values
  getCurriculums: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT curriculum_th, curriculum_en 
         FROM professor_courses 
         WHERE curriculum_th IS NOT NULL AND curriculum_en IS NOT NULL
         ORDER BY curriculum_th`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Get curriculums error:', error);
      res.status(500).json({ error: 'Failed to fetch curriculums' });
    }
  },

  // Get all courses registered by this professor (with instructors)
  getAllCourses: async (req, res) => {
    try {
      const professorId = req.user.userId;
      
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
         WHERE pc.professor_id = $1 
         GROUP BY pc.id
         ORDER BY pc.created_at DESC`,
        [professorId]
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
        curriculum_th,
        curriculum_en,
        description_th,
        description_en,
        website,
        instructors
      } = req.body;

      // Validate required fields
      if (!name_th || !name_en || !code_th || !code_en || 
          !curriculum_th || !curriculum_en || !description_th || !description_en) {
        return res.status(400).json({ 
          error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' 
        });
      }

      const result = await client.query(
        `INSERT INTO professor_courses 
         (professor_id, name_th, name_en, code_th, code_en, curriculum_th, curriculum_en, 
          description_th, description_en, website) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [professorId, name_th, name_en, code_th, code_en, curriculum_th, curriculum_en, 
         description_th, description_en, website || null]
      );

      const courseId = result.rows[0].id;

      // Insert instructors if provided
      if (instructors && instructors.length > 0) {
        for (const instructor of instructors) {
          if (instructor.trim()) {
            await client.query(
              `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
              [courseId, instructor.trim()]
            );
          }
        }
      }

      await client.query('COMMIT');

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
        curriculum_th,
        curriculum_en,
        description_th,
        description_en,
        website,
        instructors
      } = req.body;

      // Check if course belongs to this professor
      const checkCourse = await client.query(
        'SELECT * FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (checkCourse.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const result = await client.query(
        `UPDATE professor_courses 
         SET name_th = $1, name_en = $2, code_th = $3, code_en = $4,
             curriculum_th = $5, curriculum_en = $6, description_th = $7,
             description_en = $8, website = $9, updated_at = NOW()
         WHERE id = $10 AND professor_id = $11
         RETURNING *`,
        [name_th, name_en, code_th, code_en, curriculum_th, curriculum_en,
         description_th, description_en, website || null, id, professorId]
      );

      // Delete existing instructors and re-insert
      await client.query('DELETE FROM course_instructors WHERE course_id = $1', [id]);

      // Insert new instructors if provided
      if (instructors && instructors.length > 0) {
        for (const instructor of instructors) {
          if (instructor.trim()) {
            await client.query(
              `INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)`,
              [id, instructor.trim()]
            );
          }
        }
      }

      await client.query('COMMIT');

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
  }
};

module.exports = courseRegistrationController;

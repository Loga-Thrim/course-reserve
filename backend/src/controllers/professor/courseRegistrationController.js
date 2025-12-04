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

  // Get all courses registered by this professor
  getAllCourses: async (req, res) => {
    try {
      const professorId = req.user.userId;
      
      const result = await pool.query(
        `SELECT * FROM professor_courses 
         WHERE professor_id = $1 
         ORDER BY created_at DESC`,
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
    try {
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
        website
      } = req.body;

      // Validate required fields
      if (!name_th || !name_en || !code_th || !code_en || 
          !curriculum_th || !curriculum_en || !description_th || !description_en) {
        return res.status(400).json({ 
          error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' 
        });
      }

      const result = await pool.query(
        `INSERT INTO professor_courses 
         (professor_id, name_th, name_en, code_th, code_en, curriculum_th, curriculum_en, 
          description_th, description_en, website) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [professorId, name_th, name_en, code_th, code_en, curriculum_th, curriculum_en, 
         description_th, description_en, website || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  },

  // Update a course
  updateCourse: async (req, res) => {
    try {
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
        website
      } = req.body;

      // Check if course belongs to this professor
      const checkCourse = await pool.query(
        'SELECT * FROM professor_courses WHERE id = $1 AND professor_id = $2',
        [id, professorId]
      );

      if (checkCourse.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      const result = await pool.query(
        `UPDATE professor_courses 
         SET name_th = $1, name_en = $2, code_th = $3, code_en = $4,
             curriculum_th = $5, curriculum_en = $6, description_th = $7,
             description_en = $8, website = $9, updated_at = NOW()
         WHERE id = $10 AND professor_id = $11
         RETURNING *`,
        [name_th, name_en, code_th, code_en, curriculum_th, curriculum_en,
         description_th, description_en, website || null, id, professorId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
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

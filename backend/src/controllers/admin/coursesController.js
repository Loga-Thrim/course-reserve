const pool = require('../../config/db');

const adminCoursesController = {
  // Get all courses (optionally filter by curriculum_id)
  getAllCourses: async (req, res) => {
    try {
      const { curriculum_id } = req.query;

      let query = `
        SELECT c.id, c.name, c.curriculum_id, cu.name AS curriculum_name, cu.level, cu.faculty_id,
               f.name AS faculty_name, c.created_at
        FROM courses c
        JOIN curriculums cu ON c.curriculum_id = cu.id
        JOIN faculties f ON cu.faculty_id = f.id
      `;
      const params = [];

      if (curriculum_id) {
        params.push(curriculum_id);
        query += ' WHERE c.curriculum_id = $1';
      }

      query += ' ORDER BY c.id';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create course
  createCourse: async (req, res) => {
    try {
      const { name, curriculum_id } = req.body;

      if (!name || !curriculum_id) {
        return res.status(400).json({ error: 'Name and curriculum_id are required' });
      }

      const result = await pool.query(
        'INSERT INTO courses (name, curriculum_id) VALUES ($1, $2) RETURNING *',
        [name, curriculum_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create course error:', error);
      if (error.code === '23503') { // foreign key violation
        return res.status(400).json({ error: 'Invalid curriculum_id' });
      }
      if (error.code === '23505') { // unique constraint violation
        return res.status(400).json({ error: 'Course already exists for this curriculum' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, curriculum_id } = req.body;

      const result = await pool.query(
        'UPDATE courses SET name = $1, curriculum_id = $2 WHERE id = $3 RETURNING *',
        [name, curriculum_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update course error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid curriculum_id' });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Course already exists for this curriculum' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Delete course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM courses WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminCoursesController;

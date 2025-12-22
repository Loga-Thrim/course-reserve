const pool = require('../../config/db');

const adminCurriculumsController = {
  getAllCurriculums: async (req, res) => {
    try {
      const { faculty_id } = req.query;

      let query = `
        SELECT c.id, c.name, c.level, c.faculty_id, f.name AS faculty_name, c.created_at
        FROM curriculums c
        JOIN faculties f ON c.faculty_id = f.id
      `;
      const params = [];

      if (faculty_id) {
        params.push(faculty_id);
        query += ' WHERE c.faculty_id = $1';
      }

      query += ' ORDER BY c.id';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Get curriculums error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  createCurriculum: async (req, res) => {
    try {
      const { name, faculty_id, level } = req.body;

      if (!name || !faculty_id) {
        return res.status(400).json({ error: 'Name and faculty_id are required' });
      }

      const result = await pool.query(
        'INSERT INTO curriculums (name, level, faculty_id) VALUES ($1, $2, $3) RETURNING *',
        [name, level || null, faculty_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create curriculum error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid faculty_id' });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Curriculum already exists for this faculty' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateCurriculum: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, faculty_id, level } = req.body;

      const result = await pool.query(
        'UPDATE curriculums SET name = $1, level = $2, faculty_id = $3 WHERE id = $4 RETURNING *',
        [name, level || null, faculty_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Curriculum not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update curriculum error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid faculty_id' });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Curriculum already exists for this faculty' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteCurriculum: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM curriculums WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Curriculum not found' });
      }

      res.json({ message: 'Curriculum deleted successfully' });
    } catch (error) {
      console.error('Delete curriculum error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminCurriculumsController;

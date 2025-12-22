const pool = require('../../config/db');

const adminFacultiesController = {
  getAllFaculties: async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM faculties ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Get faculties error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  createFaculty: async (req, res) => {
    try {
      const { name } = req.body;

      const result = await pool.query(
        'INSERT INTO faculties (name) VALUES ($1) RETURNING *',
        [name]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create faculty error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Faculty already exists' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  },

  updateFaculty: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const result = await pool.query(
        'UPDATE faculties SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update faculty error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  deleteFaculty: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM faculties WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
      console.error('Delete faculty error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminFacultiesController;

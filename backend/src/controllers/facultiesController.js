const pool = require('../config/db');

const facultiesController = {
  getAllFaculties: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name FROM faculties ORDER BY id'
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Get faculties error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = facultiesController;

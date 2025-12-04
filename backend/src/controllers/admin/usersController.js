const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const adminUsersController = {
  // Get all users with pagination
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, email, name, faculty, role, created_at
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        query += ` AND (LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1))`;
        params.push(`%${search}%`);
      }

      // Get total count
      const countQuery = query.replace('SELECT id, email, name, faculty, role, created_at', 'SELECT COUNT(*) as total');
      const totalResult = await pool.query(countQuery, params);
      const total = parseInt(totalResult.rows[0].total);

      // Get paginated users
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const users = await pool.query(query, params);

      res.json({
        users: users.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, faculty, role } = req.body;

      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, faculty = $3, role = $4 WHERE id = $5 RETURNING id, email, name, faculty, role, created_at',
        [name, email, faculty, role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Create user
  createUser: async (req, res) => {
    try {
      const { email, password, name, faculty, role = 'user' } = req.body;

      // Check if user exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, name, faculty, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, faculty, role, created_at',
        [email, passwordHash, name, faculty, role]
      );

      res.status(201).json(newUser.rows[0]);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};

module.exports = adminUsersController;

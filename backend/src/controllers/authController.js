const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db');

const authController = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, faculty } = req.body;
      const role = 'user'; // Default role for new users

      const userExists = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, name, faculty, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, faculty, role, created_at',
        [email, passwordHash, name, faculty, role]
      );

      const token = jwt.sign(
        { 
          userId: newUser.rows[0].id, 
          email: newUser.rows[0].email,
          name: newUser.rows[0].name,
          role: newUser.rows[0].role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: newUser.rows[0]
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (user.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.rows[0].id, 
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role,
          created_at: user.rows[0].created_at
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await pool.query(
        'SELECT id, email, name, created_at FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user.rows[0]);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = authController;

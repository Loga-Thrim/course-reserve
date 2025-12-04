const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const borrowsRoutes = require('./routes/borrows');
const recommendationsRoutes = require('./routes/recommendations');
const categoriesRoutes = require('./routes/categories');
const facultiesRoutes = require('./routes/faculties');
const adminRoutes = require('./routes/admin');
const professorRoutes = require('./routes/professor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/borrows', borrowsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/professor', professorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Book Recommendation API ready`);
});

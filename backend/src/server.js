const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const facultiesRoutes = require('./routes/faculties');
const adminRoutes = require('./routes/admin');
const professorRoutes = require('./routes/professor');
const courseBooksRoutes = require('./routes/courseBooks');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/course-books', courseBooksRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    data: process.env.NEXT_PUBLIC_API_URL
  });
});

// Proxy all non-API requests to Next.js frontend
if (process.env.NODE_ENV === 'production') {
  app.use(
    '/',
    createProxyMiddleware({
      target: FRONTEND_URL,
      changeOrigin: true,
      ws: true,
    })
    // (req, res) => res.end("==== > works")
  );
}

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

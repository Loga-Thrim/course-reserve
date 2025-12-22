const jwt = require('jsonwebtoken');

const professorAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user has professor or admin role
    if (decoded.role !== 'professor' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Professor or Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = professorAuth;

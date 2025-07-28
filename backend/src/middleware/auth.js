const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userService = require('../services/userService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify token exists in database and is not revoked
    const isValidToken = await userService.validateToken(token, decoded.userId);
    if (!isValidToken) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid or expired token',
      });
    }

    // Get user data
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found or inactive',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired',
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
};

module.exports = {
  authenticateToken,
};

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { sequelize } = require('../config/sequelize');
const { userStorage } = require('../config/memoryStorage');

// Check if MySQL is connected
const isDatabaseConnected = () => {
  return (
    sequelize.connectionManager &&
    sequelize.connectionManager._state !== "disconnected"
  );
};

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Add user from payload to request object
    req.user = decoded;

    // Check if user still exists in database
    if (isDatabaseConnected()) {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }
    } else {
      // Memory storage check
      const users = await userStorage.findAll();
      const user = users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }
    }

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional middleware that doesn't block requests without token
exports.optionalVerifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Add user from payload to request object
      req.user = decoded;

      // Check if user still exists in database
      try {
        if (isDatabaseConnected()) {
          const user = await User.findByPk(req.user.id);
          if (user) {
            // Only add user info to request, not the full model
            req.user = {
              id: user.id,
              username: user.username
            };
          }
        } else {
          // Memory storage check
          const users = await userStorage.findAll();
          const user = users.find(u => u.id === req.user.id);
          if (user) {
            req.user = {
              id: user.id,
              username: user.username
            };
          }
        }
      } catch (dbError) {
        // Database error, but we don't block the request
        console.error('Database error in optional token verification:', dbError);
      }
    }
  } catch (error) {
    // Token is invalid or expired, but we don't block the request
    console.error('Error verifying optional token:', error);
  }

  next();
};
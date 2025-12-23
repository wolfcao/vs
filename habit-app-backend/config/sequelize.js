const { Sequelize } = require('sequelize');
const config = require('./config');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.username,
  config.mysql.password,
  {
    host: config.mysql.host,
    port: config.mysql.port,
    dialect: config.mysql.dialect,
    logging: config.nodeEnv === 'development' ? 
      (sql, timing) => {
        // Skip all SQL logging for development to reduce noise
        // In production, logging is disabled entirely
        return;
      } : false,
    define: {
      timestamps: true, // Enable timestamps by default
      underscored: true, // Use snake_case for column names
    }
  }
);

// Test database connection
const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected...');
    return true;
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  connectMySQL
};

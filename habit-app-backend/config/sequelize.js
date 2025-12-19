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
        // Filter out low-level hex value logs from MySQL driver
        if (typeof sql === 'string' && !/\[0x[a-f0-9]+(\s+0x[a-f0-9]+)*\]/.test(sql)) {
          console.log(`[SQL] ${sql} (${timing}ms)`);
        }
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

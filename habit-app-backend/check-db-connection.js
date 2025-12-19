const { sequelize } = require('./config/sequelize');

async function checkConnection() {
  try {
    console.log('Connection state:', sequelize.connectionManager.state);
    
    await sequelize.authenticate();
    console.log('MySQL is connected successfully!');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1+1 AS result');
    console.log('Query result:', results);
    
  } catch (error) {
    console.error('MySQL connection error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

checkConnection();

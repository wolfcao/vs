const mysql = require('mysql2/promise');
const fs = require('fs');

async function generateDBSchema() {
  // Create connection to MySQL
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'habit_app'
  });

  try {
    // Start the README content
    let content = '# Habit App Database Schema\n\n';
    content += '## Database Tables\n\n';

    // Get list of tables
    const [tables] = await connection.execute('SHOW TABLES');
    
    // For each table, get the CREATE TABLE statement
    for (const tableRow of tables) {
      const tableName = tableRow[`Tables_in_${'habit_app'}`];
      content += `### ${tableName}\n\n`;
      content += '```sql\n';
      
      // Get CREATE TABLE statement
      const [createTable] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
      if (createTable.length > 0) {
        content += createTable[0]['Create Table'] + '\n';
      }
      
      content += '```\n\n';
    }

    // Write to README.md
    fs.writeFileSync('DATA.md', content);
    console.log('Database schema written to DATA.md');
  } catch (error) {
    console.error('Error generating database schema:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Run the function
generateDBSchema();
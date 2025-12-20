const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/sequelize');

async function resetPasswords() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Reset testuser password
    const testuser = await User.findOne({ where: { username: 'testuser' } });
    if (testuser) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await testuser.update({ password: hashedPassword });
      console.log('testuser password reset to password');
    } else {
      console.log('testuser not found');
    }

    // Reset caojialiang password
    const caojialiang = await User.findOne({ where: { username: 'caojialiang' } });
    if (caojialiang) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await caojialiang.update({ password: hashedPassword });
      console.log('caojialiang password reset to password');
    } else {
      console.log('caojialiang not found');
    }

    console.log('All passwords reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords();
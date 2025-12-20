const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/sequelize');

async function resetPasswords() {
  try {
    // 连接到数据库
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    // 获取密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // 更新testuser密码
    const testUser = await User.findOne({ where: { username: 'testuser' } });
    if (testUser) {
      await testUser.update({ password: hashedPassword });
      console.log('Updated testuser password');
    } else {
      console.log('testuser not found');
    }

    // 更新caojialiang密码
    const caoUser = await User.findOne({ where: { username: 'caojialiang' } });
    if (caoUser) {
      await caoUser.update({ password: hashedPassword });
      console.log('Updated caojialiang password');
    } else {
      console.log('caojialiang not found');
    }

    // 关闭数据库连接
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  }
}

resetPasswords();
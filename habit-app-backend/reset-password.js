const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/sequelize');

const resetPasswords = async () => {
  try {
    console.log('开始重置用户密码...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功！');
    
    // 生成新的密码哈希
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 更新caojialiang用户的密码
    const [result] = await sequelize.query(
      `UPDATE users SET password = ? WHERE username = 'caojialiang'`,
      { replacements: [hashedPassword] }
    );
    
    console.log(`已更新 ${result.affectedRows} 条记录`);
    console.log('密码重置成功！用户caojialiang的新密码是: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('密码重置失败:', error.message);
    process.exit(1);
  }
};

resetPasswords();
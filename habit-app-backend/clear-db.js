const { sequelize, connectMySQL } = require("./config/sequelize");

const clearDatabase = async () => {
  try {
    console.log("开始清理数据库...");

    // 测试数据库连接
    const connected = await connectMySQL();
    if (!connected) {
      console.error("数据库连接失败！");
      process.exit(1);
    }
    console.log("数据库连接成功！");

    // 开始事务
    await sequelize.transaction(async (t) => {
      // 清空表数据，注意顺序：先清空外键依赖的表
      console.log("正在清空 time_modification_requests 表...");
      const [timeResult] = await sequelize.query(
        "DELETE FROM time_modification_requests",
        { transaction: t }
      );
      console.log(`已删除 ${timeResult.affectedRows || 0} 条时间修改请求记录`);

      console.log("正在清空 team_members 表...");
      const [memberResult] = await sequelize.query("DELETE FROM team_members", {
        transaction: t,
      });
      console.log(`已删除 ${memberResult.affectedRows || 0} 条团队成员记录`);

      console.log("正在清空 active_habits 表...");
      const [activeResult] = await sequelize.query(
        "DELETE FROM active_habits",
        { transaction: t }
      );
      console.log(`已删除 ${activeResult.affectedRows || 0} 条活跃习惯记录`);

      console.log("正在清空 sub_tasks 表...");
      const [subTaskResult] = await sequelize.query("DELETE FROM sub_tasks", {
        transaction: t,
      });
      console.log(`已删除 ${subTaskResult.affectedRows || 0} 条子任务记录`);

      console.log("正在清空 habit_definitions 表...");
      const [habitResult] = await sequelize.query(
        "DELETE FROM habit_definitions",
        { transaction: t }
      );
      console.log(`已删除 ${habitResult.affectedRows || 0} 条习惯定义记录`);

      // 保留用户数据
      // await sequelize.query('DELETE FROM users', { transaction: t });
    });

    console.log("\n✅ 数据库清理完成！所有加入记录已被清空。");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ 数据库清理失败:", error.message);
    console.error("详细错误:", error);
    process.exit(1);
  }
};

clearDatabase();

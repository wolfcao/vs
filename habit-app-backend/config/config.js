require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/habit-app",
  nodeEnv: process.env.NODE_ENV || "development",
  // JWT configuration
  jwt: {
    secret:
      process.env.JWT_SECRET || "your-secret-key-here-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  // MySQL configuration
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    username: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "habit_app",
    dialect: "mysql",
  },
};

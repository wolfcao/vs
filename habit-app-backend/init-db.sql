-- Habit App Database Initialization Script
-- This script creates the complete database schema with initial data

-- 1. Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS habit_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE habit_app;

-- 2. Drop tables if they exist (in reverse order of creation to avoid foreign key conflicts)
DROP TABLE IF EXISTS time_modification_requests;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS active_habits;
DROP TABLE IF EXISTS habit_definition_categories;
DROP TABLE IF EXISTS sub_tasks;
DROP TABLE IF EXISTS habit_definitions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 3. Create tables in the correct order

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  gender ENUM('male','female','other') DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Habit definitions table
CREATE TABLE habit_definitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category ENUM('health','learning','creativity','productivity') DEFAULT NULL,
  required_team_size INT NOT NULL,
  duration_days INT NOT NULL,
  daily_start_time VARCHAR(255) NOT NULL,
  author_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sub tasks table
CREATE TABLE sub_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  min_duration_minutes INT NOT NULL,
  habit_definition_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_definition_id) REFERENCES habit_definitions(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Habit definition categories junction table
CREATE TABLE habit_definition_categories (
  habit_definition_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (habit_definition_id, category_id),
  FOREIGN KEY (habit_definition_id) REFERENCES habit_definitions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Active habits table
CREATE TABLE active_habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  habit_definition_id INT NOT NULL,
  habit_snapshot LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  start_date DATETIME DEFAULT NULL,
  my_logs LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  current_day INT DEFAULT 1,
  has_modified_time_today TINYINT(1) DEFAULT 0,
  user_id INT NOT NULL,
  status ENUM('pending','active') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_definition_id) REFERENCES habit_definitions(id) ON DELETE NO ACTION ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Team members table
CREATE TABLE team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NOT NULL,
  progress INT DEFAULT 0,
  status ENUM('idle','active','completed') DEFAULT 'idle',
  active_habit_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (active_habit_id) REFERENCES active_habits(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Time modification requests table
CREATE TABLE time_modification_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(255) NOT NULL,
  new_time VARCHAR(255) NOT NULL,
  approvals JSON DEFAULT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  active_habit_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (active_habit_id) REFERENCES active_habits(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Insert initial data

-- Insert sample users
INSERT INTO users (name, username, email, password, avatar, gender) VALUES
('曹家良', 'caojialiang', 'caojialiang@example.com', '$2b$10$samplepasswordhash1', 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100', 'male'),
('测试用户', 'testuser', 'testuser@example.com', '$2b$10$samplepasswordhash2', 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100', 'female');

-- Insert sample categories
INSERT INTO categories (name) VALUES
('健康与健身'),
('学习与成长'),
('工作与生产力'),
('创意与艺术'),
('阅读与写作'),
('冥想与正念');

-- Insert sample habit definitions
INSERT INTO habit_definitions (title, description, category, required_team_size, duration_days, daily_start_time, author_id) VALUES
('晨跑30分钟', '每天早上坚持跑步30分钟，提升身体素质', 'health', 2, 21, '06:00', 1),
('阅读学习', '每天阅读至少30分钟，提升知识储备', 'learning', 2, 30, '20:00', 2),
('团队项目开发', '团队协作开发一个项目，提升编程技能', 'productivity', 3, 14, '19:00', 1);

-- Insert sample sub tasks
INSERT INTO sub_tasks (name, min_duration_minutes, habit_definition_id) VALUES
('热身运动', 5, 1),
('跑步', 30, 1),
('拉伸放松', 5, 1),
('阅读书籍', 30, 2),
('做笔记', 10, 2),
('项目讨论', 30, 3),
('编码实现', 90, 3),
('代码审查', 30, 3);

-- Insert sample habit definition categories
INSERT INTO habit_definition_categories (habit_definition_id, category_id) VALUES
(1, 1),
(2, 2),
(2, 5),
(3, 3);

-- Insert sample active habits
INSERT INTO active_habits (habit_definition_id, habit_snapshot, start_date, user_id, status) VALUES
(1, '{"id": 1, "title": "晨跑30分钟", "description": "每天早上坚持跑步30分钟，提升身体素质", "category": "health", "requiredTeamSize": 2, "durationDays": 21, "dailyStartTime": "06:00", "authorId": 1}', CURRENT_DATE(), 1, 'active'),
(2, '{"id": 2, "title": "阅读学习", "description": "每天阅读至少30分钟，提升知识储备", "category": "learning", "requiredTeamSize": 2, "durationDays": 30, "dailyStartTime": "20:00", "authorId": 2}', CURRENT_DATE(), 2, 'active');

-- Insert sample team members
INSERT INTO team_members (user_id, name, avatar, active_habit_id) VALUES
(1, '曹家良', 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100', 1),
(2, '测试用户', 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100', 2);

-- 5. Create indexes for better performance
CREATE INDEX idx_active_habits_user_id ON active_habits(user_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_habit_definitions_author_id ON habit_definitions(author_id);
CREATE INDEX idx_sub_tasks_habit_definition_id ON sub_tasks(habit_definition_id);

-- 6. Verify database creation
SELECT 'Database initialization completed successfully!' AS message;
SELECT 'Users:', COUNT(*) FROM users;
SELECT 'Categories:', COUNT(*) FROM categories;
SELECT 'Habit Definitions:', COUNT(*) FROM habit_definitions;
SELECT 'Sub Tasks:', COUNT(*) FROM sub_tasks;
SELECT 'Active Habits:', COUNT(*) FROM active_habits;
SELECT 'Team Members:', COUNT(*) FROM team_members;

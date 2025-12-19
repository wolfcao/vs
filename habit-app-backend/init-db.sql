-- Habit App Database Initialization Script
-- This script creates the complete database schema for the Habit App

-- 1. Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS habit_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE habit_app;

-- 2. Create tables in the correct order (parent tables first)

-- Table: users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: habit_definitions
CREATE TABLE `habit_definitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `category` enum('health','learning','creativity','productivity') NOT NULL,
  `required_team_size` int(11) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `daily_start_time` varchar(255) NOT NULL,
  `author_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: sub_tasks
CREATE TABLE `sub_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `min_duration_minutes` int(11) NOT NULL,
  `habit_definition_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `habit_definition_id` (`habit_definition_id`),
  CONSTRAINT `sub_tasks_ibfk_1` FOREIGN KEY (`habit_definition_id`) REFERENCES `habit_definitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: active_habits
CREATE TABLE `active_habits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `habit_definition_id` int(11) NOT NULL,
  `habit_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `my_logs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `current_day` int(11) DEFAULT 1,
  `has_modified_time_today` tinyint(1) DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('pending','active') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `habit_definition_id` (`habit_definition_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `active_habits_ibfk_1` FOREIGN KEY (`habit_definition_id`) REFERENCES `habit_definitions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `active_habits_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: team_members
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `progress` int(11) DEFAULT 0,
  `status` enum('idle','active','completed') DEFAULT 'idle',
  `active_habit_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `active_habit_id` (`active_habit_id`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`active_habit_id`) REFERENCES `active_habits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: time_modification_requests
CREATE TABLE `time_modification_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(255) NOT NULL,
  `new_time` varchar(255) NOT NULL,
  `approvals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `active_habit_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `active_habit_id` (`active_habit_id`),
  CONSTRAINT `time_modification_requests_ibfk_1` FOREIGN KEY (`active_habit_id`) REFERENCES `active_habits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Add JSON validation if MySQL version supports it
-- Note: json_valid function requires MySQL 8.0.13+ with validate_json plugin enabled
-- Uncomment the following lines if your MySQL version supports it
/*
ALTER TABLE `active_habits`
  ADD CONSTRAINT `active_habits_habit_snapshot_check` CHECK (json_valid(`habit_snapshot`)),
  ADD CONSTRAINT `active_habits_my_logs_check` CHECK (json_valid(`my_logs`));

ALTER TABLE `time_modification_requests`
  ADD CONSTRAINT `time_modification_requests_approvals_check` CHECK (json_valid(`approvals`));
*/

-- 4. Create indexes for better performance
CREATE INDEX idx_active_habits_user_id ON active_habits(user_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_habit_definitions_author_id ON habit_definitions(author_id);

-- 5. Insert sample data (optional)
-- Uncomment the following lines to insert sample data
/*
-- Insert sample user
INSERT INTO users (name, avatar, email, password, username) VALUES 
('测试用户', 'https://thirdqq.qlogo.cn/ek_qqapp/AQVJKMtqeFCGNEZqicOj7qb7mnpcJiaZNlEOf0iasx2DicuEycbIG9cQktWUBxWR1dFWfLMI2Ilt/100', 'test@example.com', '$2b$10$samplepasswordhash', 'testuser');

-- Insert sample habit definition
INSERT INTO habit_definitions (title, description, category, required_team_size, duration_days, daily_start_time, author_id, created_at, updated_at) VALUES 
('晨跑30分钟', '每天早上坚持跑步30分钟，提升身体素质', 'health', 2, 21, '06:00', 1, NOW(), NOW());
*/

-- Database initialization completed successfully!
SELECT 'Database schema created successfully!' AS message;

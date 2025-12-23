# Habit App Database Schema

## Database Tables

### active_habits

```sql
CREATE TABLE `active_habits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `habit_definition_id` int(11) NOT NULL,
  `habit_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`habit_snapshot`)),
  `start_date` datetime DEFAULT NULL,
  `my_logs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`my_logs`)),
  `current_day` int(11) DEFAULT 1,
  `has_modified_time_today` tinyint(1) DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('pending','active') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `habit_definition_id` (`habit_definition_id`),
  CONSTRAINT `active_habits_ibfk_1` FOREIGN KEY (`habit_definition_id`) REFERENCES `habit_definitions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4
```

### habit_definitions

```sql
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4
```

### sub_tasks

```sql
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4
```

### team_members

```sql
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
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`active_habit_id`) REFERENCES `active_habits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4
```

### time_modification_requests

```sql
CREATE TABLE `time_modification_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(255) NOT NULL,
  `new_time` varchar(255) NOT NULL,
  `approvals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`approvals`)),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `active_habit_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `active_habit_id` (`active_habit_id`),
  CONSTRAINT `time_modification_requests_ibfk_1` FOREIGN KEY (`active_habit_id`) REFERENCES `active_habits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
```

### users

```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `username_19` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4
```


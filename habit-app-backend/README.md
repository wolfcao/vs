# Habit App Backend

This is the backend API for the Habit Tracking application, built with Node.js, Express, and MySQL.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Database Configuration](#database-configuration)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Development](#development)

## Features

- User management
- Habit definition creation and management
- Active habit tracking
- Subtask management
- Team collaboration
- Time modification requests

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MySQL** - Relational database management system
- **Sequelize** - ORM for database operations
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```
PORT=3001
NODE_ENV=development

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=habit_app
```

3. Start the server:
```bash
npm start
```

## Database Configuration

The application uses MySQL as its primary database. Ensure you have MySQL installed and running on your system.

### Database Creation

Create the database manually:
```sql
CREATE DATABASE habit_app;
```

The Sequelize ORM will automatically create the necessary tables when the server starts.

### Migration from MongoDB to MySQL

This project was originally developed using MongoDB but has been migrated to MySQL. The key changes include:

- Conversion of Mongoose models to Sequelize models
- Implementation of relational database schema with foreign keys
- Use of Sequelize ORM for database operations
- Transaction support for complex operations

## API Endpoints

### Users
- `GET /api/users/current` - Get current user
- `PUT /api/users/current` - Update current user

### Habit Definitions
- `GET /api/habits` - Get all habit definitions
- `GET /api/habits/:id` - Get habit definition by ID
- `POST /api/habits` - Create habit definition
- `PUT /api/habits/:id` - Update habit definition
- `DELETE /api/habits/:id` - Delete habit definition

### Active Habits
- `GET /api/active-habits` - Get all active habits
- `GET /api/active-habits/:id` - Get active habit by ID
- `POST /api/active-habits` - Create active habit
- `PUT /api/active-habits/:id` - Update active habit
- `DELETE /api/active-habits/:id` - Delete active habit
- `PUT /api/active-habits/:id/join` - Join active habit
- `PUT /api/active-habits/:id/toggle` - Toggle active habit timer
- `PUT /api/active-habits/:id/complete` - Complete active habit
- `POST /api/active-habits/:id/time-request` - Request time modification

## Project Structure

```
habit-app-backend/
├── config/              # Configuration files
│   ├── config.js        # Main configuration
│   ├── sequelize.js     # Sequelize configuration
│   └── memoryStorage.js # Fallback memory storage
├── controllers/         # API controllers
│   ├── userController.js
│   ├── habitDefinitionController.js
│   └── activeHabitController.js
├── models/              # Database models
│   ├── User.js
│   ├── HabitDefinition.js
│   ├── SubTask.js
│   ├── ActiveHabit.js
│   ├── TeamMember.js
│   └── TimeModificationRequest.js
├── routes/              # API routes
│   ├── userRoutes.js
│   ├── habitDefinitionRoutes.js
│   └── activeHabitRoutes.js
├── .env                 # Environment variables
├── index.js             # Application entry point
├── package.json         # Project dependencies
└── README.md            # This file
```

## Development

### Fallback Mode

If the application cannot connect to MySQL, it will automatically switch to a memory storage fallback mode for testing purposes.

### Error Handling

The application includes comprehensive error handling for database operations and API requests.

### Testing

Test the API endpoints using tools like Postman or curl:

```bash
curl http://localhost:3001/api/users/current
curl http://localhost:3001/api/habits
```
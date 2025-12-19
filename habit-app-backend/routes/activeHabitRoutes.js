const express = require('express');
const router = express.Router();
const activeHabitController = require('../controllers/activeHabitController');

// Get all active habits
router.get('/', activeHabitController.getAll);

// Join a habit
router.post('/join/:habitId', activeHabitController.joinHabit);

// Toggle timer for a subtask
router.post('/:activeHabitId/timer/:subTaskId', activeHabitController.toggleTimer);

// Complete a task
router.post('/:activeHabitId/complete/:subTaskId', activeHabitController.completeTask);

// Request a time change
router.post('/:activeHabitId/time-change', activeHabitController.requestTimeChange);

// Get a single active habit by id
router.get('/:id', activeHabitController.getById);

module.exports = router;
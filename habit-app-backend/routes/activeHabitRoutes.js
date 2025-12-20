const express = require("express");
const router = express.Router();
const activeHabitController = require("../controllers/activeHabitController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all active habits
router.get("/", authMiddleware.verifyToken, activeHabitController.getAll);

// Join a habit
router.post(
  "/join/:habitId",
  authMiddleware.verifyToken,
  activeHabitController.joinHabit
);

// Toggle timer for a subtask
router.post(
  "/:activeHabitId/timer/:subTaskId",
  authMiddleware.verifyToken,
  activeHabitController.toggleTimer
);

// Complete a task
router.post(
  "/:activeHabitId/complete/:subTaskId",
  authMiddleware.verifyToken,
  activeHabitController.completeTask
);

// Request a time change
router.post(
  "/:activeHabitId/time-change",
  authMiddleware.verifyToken,
  activeHabitController.requestTimeChange
);

// Get a single active habit by id
router.get("/:id", authMiddleware.verifyToken, activeHabitController.getById);

// Approve a join request
router.post(
  "/:activeHabitId/approve/:userId",
  authMiddleware.verifyToken,
  activeHabitController.approveJoinRequest
);

// Reject a join request
router.post(
  "/:activeHabitId/reject/:userId",
  authMiddleware.verifyToken,
  activeHabitController.rejectJoinRequest
);

module.exports = router;

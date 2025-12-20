const express = require("express");
const router = express.Router();
const habitDefinitionController = require("../controllers/habitDefinitionController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all habit definitions
router.get(
  "/",
  authMiddleware.optionalVerifyToken,
  habitDefinitionController.getAll
);

// Create a new habit definition
router.post("/", authMiddleware.verifyToken, habitDefinitionController.create);

// Get all categories
router.get("/categories", authMiddleware.verifyToken, habitDefinitionController.getAllCategories);

// Get a single habit definition by ID
router.get("/:id", habitDefinitionController.getById);

module.exports = router;

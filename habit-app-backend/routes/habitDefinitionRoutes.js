const express = require('express');
const router = express.Router();
const habitDefinitionController = require('../controllers/habitDefinitionController');

// Get all habit definitions
router.get('/', habitDefinitionController.getAll);

// Create a new habit definition
router.post('/', habitDefinitionController.create);

// Get a single habit definition by ID
router.get('/:id', habitDefinitionController.getById);

module.exports = router;
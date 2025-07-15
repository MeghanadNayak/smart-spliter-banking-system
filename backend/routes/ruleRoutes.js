// backend/routes/ruleRoutes.js
const express = require('express');
const router = express.Router();
// Authentication middleware import kiya
const { protect } = require('../middleware/auth');
// Splitting Rule Controller se saare zaroori functions import kiye
const {
    createRule,
    getRules,
    updateRule,
    deleteRule
} = require('../controllers/splittingRuleController');

// All these routes are protected by the 'protect' middleware
// POST request to create a new rule
router.post('/', protect, createRule);
// GET request to retrieve all rules for the authenticated user
router.get('/', protect, getRules);
// PUT request to update a specific rule by its ID
router.put('/:id', protect, updateRule);
// DELETE request to delete a specific rule by its ID
router.delete('/:id', protect, deleteRule);

module.exports = router;
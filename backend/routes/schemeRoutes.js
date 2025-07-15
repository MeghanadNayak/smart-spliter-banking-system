// backend/routes/schemeRoutes.js
const express = require('express');
const router = express.Router();
const {
    createScheme,
    getSchemes,
    getSchemeById,
    updateScheme,
    deleteScheme
} = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');

// All these routes are protected
router.post('/', protect, createScheme);
router.get('/', protect, getSchemes);
router.get('/:id', protect, getSchemeById); // :id will be scheme ID
router.put('/:id', protect, updateScheme);
router.delete('/:id', protect, deleteScheme);

module.exports = router;
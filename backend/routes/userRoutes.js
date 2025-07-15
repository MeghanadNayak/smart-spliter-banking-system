// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController'); // userController se functions import kiye
const { protect } = require('../middleware/auth'); // Protect middleware (agar baad mein use karna ho)

// Public routes (no authentication needed for these)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Example of a protected route (only accessible after login)
// router.get('/profile', protect, getProfile);

module.exports = router;
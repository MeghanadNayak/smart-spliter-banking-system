// backend/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
    depositFunds,
    withdrawFunds,
    getTransactions,
    getMainAccountBalance
} = require('../controllers/transactionController'); // Transaction controller functions
const { protect } = require('../middleware/auth');

// Protect all transaction routes
router.post('/deposit', protect, depositFunds);
router.post('/withdraw', protect, withdrawFunds);
router.get('/', protect, getTransactions); // Get all transactions for a user
router.get('/account/balance', protect, getMainAccountBalance); // Get user's main account balance

module.exports = router;
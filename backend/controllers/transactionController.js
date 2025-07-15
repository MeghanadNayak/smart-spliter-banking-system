// backend/controllers/transactionController.js
const Account = require('../models/Account');
const SavingsScheme = require('../models/SavingsScheme');
const SubAccount = require('../models/SubAccount');
const SplittingRule = require('../models/SplittingRule');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose'); // For transactions (sessions)

// @desc    Get main account balance
// @route   GET /api/transactions/account/balance (or /api/account/balance if a separate route)
// @access  Private
const getMainAccountBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        if (!account) {
            return res.status(404).json({ message: 'Main account not found for this user.' });
        }
        res.status(200).json({ balance: account.balance });
    } catch (error) {
        console.error('Error fetching main account balance:', error.message);
        res.status(500).json({ message: 'Server error while fetching main account balance.' });
    }
};


// @desc    Deposit funds into main account and split into schemes
// @route   POST /api/transactions/deposit
// @access  Private
const depositFunds = async (req, res) => {
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Deposit amount must be a positive number.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Update Main Account Balance
        const account = await Account.findOne({ userId }).session(session);
        if (!account) {
            throw new Error('Main account not found.');
        }
        account.balance += amount;
        await account.save({ session });

        // 2. Record main transaction
        const mainTransaction = await Transaction.create([{
            userId,
            type: 'deposit',
            amount,
            description: 'Initial deposit to main account',
            date: new Date(),
        }], { session });

        // 3. Get all active splitting rules for the user
        const rules = await SplittingRule.find({ userId, isActive: true }).session(session);
        const totalRulePercentage = rules.reduce((sum, rule) => sum + rule.value, 0);

        // 4. Split funds according to rules
        const splitTransactions = [];
        let remainingAmount = amount;

        for (const rule of rules) {
            const scheme = await SavingsScheme.findOne({ _id: rule.schemeId, userId }).session(session);
            if (!scheme) {
                console.warn(`Scheme with ID ${rule.schemeId} not found for rule. Skipping.`);
                continue;
            }

            const subAccount = await SubAccount.findOne({ schemeId: rule.schemeId, userId }).session(session);
            if (!subAccount) {
                console.warn(`SubAccount for scheme ID ${rule.schemeId} not found. Skipping.`);
                continue;
            }

            // Calculate split amount based on the rule's percentage
            // Ensure correct calculation even if totalRulePercentage is less than 100
            const splitAmount = (amount * rule.value) / 100; // Using rule.value which is the percentage

            subAccount.balance += splitAmount;
            await subAccount.save({ session });

            splitTransactions.push({
                userId,
                type: 'deposit',
                amount: splitAmount,
                schemeId: rule.schemeId,
                subAccountId: subAccount._id,
                description: `Split to ${scheme.schemeName} (${rule.value}%)`,
                date: new Date(),
            });
            remainingAmount -= splitAmount;
        }

        // Handle any remaining amount if total percentage < 100 or due to rounding
        if (remainingAmount > 0.01) { // Small buffer for floating point inaccuracies
            // Option 1: Add to a default "unallocated" scheme if exists
            // Option 2: Leave in main account (already done) and log.
            console.log(`Remaining unallocated amount after splitting: ${remainingAmount.toFixed(2)}`);
        }


        // 5. Record split transactions (if any)
        if (splitTransactions.length > 0) {
            await Transaction.insertMany(splitTransactions, { session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Deposit successful and funds split.', mainAccountBalance: account.balance });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error during deposit and splitting:', error.message);
        res.status(500).json({ message: 'Server error during deposit and splitting.' });
    }
};

// @desc    Withdraw funds from a specific sub-account (scheme)
// @route   POST /api/transactions/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
    const { amount, schemeId } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Withdrawal amount must be a positive number.' });
    }
    if (!schemeId) {
        return res.status(400).json({ message: 'Scheme is required for withdrawal.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find the sub-account
        const subAccount = await SubAccount.findOne({ schemeId, userId }).session(session);
        if (!subAccount) {
            throw new Error('Sub-account not found for this scheme or user.');
        }

        // 2. Check if sufficient balance
        if (subAccount.balance < amount) {
            throw new Error('Insufficient balance in the selected scheme.');
        }

        // 3. Update sub-account balance
        subAccount.balance -= amount;
        await subAccount.save({ session });

        // 4. Update main account balance (funds are withdrawn from a scheme, effectively going back to user's available funds)
        const mainAccount = await Account.findOne({ userId }).session(session);
        if (!mainAccount) {
            throw new Error('Main account not found.');
        }
        mainAccount.balance += amount; // Withdrawal from scheme adds to main account
        await mainAccount.save({ session });

        // 5. Record transaction
        const scheme = await SavingsScheme.findById(schemeId).session(session);
        await Transaction.create([{
            userId,
            type: 'withdrawal',
            amount,
            schemeId,
            subAccountId: subAccount._id,
            description: `Withdrawal from ${scheme ? scheme.schemeName : 'a scheme'}`,
            date: new Date(),
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Funds withdrawn successfully.', mainAccountBalance: mainAccount.balance });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error during withdrawal:', error.message);
        // Specific error messages for client
        if (error.message.includes('Insufficient balance')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during withdrawal.' });
    }
};


// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        // Populate schemeId to get schemeName for display
        const transactions = await Transaction.find({ userId: req.userId })
                                            .populate('schemeId', 'schemeName') // Only get schemeName
                                            .sort({ date: -1 }); // Latest first

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ message: 'Server error while fetching transactions.' });
    }
};


module.exports = {
    depositFunds,
    withdrawFunds,
    getTransactions,
    getMainAccountBalance,
};
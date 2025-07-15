const SplittingRule = require('../models/SplittingRule');
const SavingsScheme = require('../models/SavingsScheme');
const SubAccount = require('../models/SubAccount');
const Account = require('../models/Account'); // Main account balance check karne ke liye

// @desc    Create a new savings scheme and associated sub-account
// @route   POST /api/schemes
// @access  Private (Requires JWT token)
const createScheme = async (req, res) => {
    const { schemeName, description, targetAmount } = req.body;
    const userId = req.userId; // Middleware se milta hai

    if (!schemeName) {
        return res.status(400).json({ message: 'Scheme name is required' });
    }

    try {
        // Check if user already has a scheme with this name
        const existingScheme = await SavingsScheme.findOne({ userId, schemeName });
        if (existingScheme) {
            return res.status(400).json({ message: 'You already have a scheme with this name.' });
        }

        const scheme = await SavingsScheme.create({
            userId,
            schemeName,
            description,
            targetAmount: targetAmount || 0, // Default to 0 if not provided
        });

        // Create a sub-account for this scheme
        const mainAccount = await Account.findOne({ userId });
        if (!mainAccount) {
            // This should ideally not happen if user registration creates an account
            console.error(`Main account not found for user: ${userId}`);
            return res.status(500).json({ message: 'Main account not found for user.' });
        }

        const subAccount = await SubAccount.create({
            accountId: mainAccount._id,
            schemeId: scheme._id,
            userId: userId, // Redundancy for easier query
            subAccountName: schemeName,
            balance: 0,
        });

        res.status(201).json({
            scheme,
            subAccount,
            message: 'Savings scheme and sub-account created successfully'
        });
    } catch (error) {
        console.error('Error creating scheme:', error.message);
        res.status(500).json({ message: 'Server error during scheme creation.' });
    }
};

// @desc    Get all savings schemes for a user
// @route   GET /api/schemes
// @access  Private
const getSchemes = async (req, res) => {
    try {
        const userSchemes = await SavingsScheme.find({ userId: req.userId }).lean();

        if (userSchemes.length === 0) {
            return res.status(200).json([]);
        }

        const schemeIds = userSchemes.map(s => s._id);
        const subAccounts = await SubAccount.find({ schemeId: { $in: schemeIds } }).lean();

        const schemesWithSubAccounts = userSchemes.map(scheme => {
            const associatedSubAccount = subAccounts.find(sa => sa.schemeId.equals(scheme._id));
            const currentBalance = associatedSubAccount ? associatedSubAccount.balance : 0;
            return { ...scheme, currentBalance: currentBalance, subAccount: associatedSubAccount };
        });

        res.status(200).json(schemesWithSubAccounts);
    } catch (error) {
        console.error('Error fetching schemes:', error.message);
        res.status(500).json({ message: 'Server error while fetching schemes.' });
    }
};

// @desc    Get single savings scheme by ID
// @route   GET /api/schemes/:id
// @access  Private
const getSchemeById = async (req, res) => {
    try {
        const scheme = await SavingsScheme.findOne({ _id: req.params.id, userId: req.userId });
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found.' });
        }
        const subAccount = await SubAccount.findOne({ schemeId: scheme._id });
        res.status(200).json({ scheme, subAccount });
    } catch (error) {
        console.error('Error fetching scheme by ID:', error.message);
        res.status(500).json({ message: 'Server error while fetching scheme.' });
    }
};

// @desc    Update a savings scheme
// @route   PUT /api/schemes/:id
// @access  Private
const updateScheme = async (req, res) => {
    const { schemeName, description, targetAmount, isActive } = req.body;

    try {
        const scheme = await SavingsScheme.findOne({ _id: req.params.id, userId: req.userId });

        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found.' });
        }

        scheme.schemeName = schemeName || scheme.schemeName;
        scheme.description = description !== undefined ? description : scheme.description;
        scheme.targetAmount = targetAmount !== undefined ? targetAmount : scheme.targetAmount;
        scheme.isActive = isActive !== undefined ? isActive : scheme.isActive;

        const updatedScheme = await scheme.save();

        // Also update sub-account name if scheme name changes
        const subAccount = await SubAccount.findOne({ schemeId: updatedScheme._id });
        if (subAccount && schemeName) {
            subAccount.subAccountName = schemeName;
            await subAccount.save();
        }

        res.status(200).json({
            scheme: updatedScheme,
            subAccount, // Return updated subAccount for consistency
            message: 'Scheme updated successfully'
        });
    } catch (error) {
        console.error('Error updating scheme:', error.message);
        res.status(500).json({ message: 'Server error during scheme update.' });
    }
};

// @desc    Delete a savings scheme and its associated sub-account and rule
// @route   DELETE /api/schemes/:id
// @access  Private
const deleteScheme = async (req, res) => {
    try {
        const scheme = await SavingsScheme.findOne({ _id: req.params.id, userId: req.userId });

        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found.' });
        }

        await scheme.deleteOne(); // Use deleteOne() on the document itself
        await SubAccount.deleteOne({ schemeId: req.params.id });
        await SplittingRule.deleteOne({ schemeId: req.params.id }); // Ensure SplittingRule model is required if used here

        res.status(200).json({ message: 'Scheme, sub-account, and rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting scheme:', error.message);
        res.status(500).json({ message: 'Server error during scheme deletion.' });
    }
};

module.exports = {
    createScheme,
    getSchemes,
    getSchemeById,
    updateScheme,
    deleteScheme,
};
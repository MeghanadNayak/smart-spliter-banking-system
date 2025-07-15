// backend/controllers/ruleController.js
const SplittingRule = require('../models/SplittingRule');
const SavingsScheme = require('../models/SavingsScheme');

// @desc    Create or Update a splitting rule for a scheme
// @route   POST /api/rules
// @access  Private
const createOrUpdateRule = async (req, res) => {
    const { schemeId, splitType, value } = req.body;
    const userId = req.userId; // Middleware se milta hai

    if (!schemeId || !splitType || value === undefined) {
        return res.status(400).json({ message: 'Please provide schemeId, splitType, and value.' });
    }

    if (splitType === 'percentage' && (value < 0 || value > 100)) {
        return res.status(400).json({ message: 'Percentage must be between 0 and 100.' });
    }
    if (splitType === 'fixed' && value < 0) {
        return res.status(400).json({ message: 'Fixed amount cannot be negative.' });
    }

    try {
        // Ensure the scheme belongs to the user
        const scheme = await SavingsScheme.findOne({ _id: schemeId, userId });
        if (!scheme) {
            return res.status(404).json({ message: 'Scheme not found or does not belong to user.' });
        }

        let rule = await SplittingRule.findOne({ schemeId, userId });

        if (rule) {
            // Update existing rule
            rule.splitType = splitType;
            rule.value = value;
            rule.isActive = true; // Rule is active when updated
            await rule.save();
            res.status(200).json({ rule, message: 'Splitting rule updated successfully.' });
        } else {
            // Create new rule
            rule = await SplittingRule.create({
                userId,
                schemeId,
                splitType,
                value,
                isActive: true,
            });
            res.status(201).json({ rule, message: 'Splitting rule created successfully.' });
        }
    } catch (error) {
        console.error('Error creating or updating rule:', error.message);
        res.status(500).json({ message: 'Server error during rule operation.' });
    }
};

// @desc    Get splitting rule for a specific scheme
// @route   GET /api/rules/:schemeId
// @access  Private
const getRuleBySchemeId = async (req, res) => {
    const { schemeId } = req.params;
    const userId = req.userId;

    try {
        const rule = await SplittingRule.findOne({ schemeId, userId });
        if (!rule) {
            return res.status(404).json({ message: 'Splitting rule not found for this scheme.' });
        }
        res.status(200).json(rule);
    } catch (error) {
        console.error('Error fetching rule:', error.message);
        res.status(500).json({ message: 'Server error while fetching rule.' });
    }
};

module.exports = {
    createOrUpdateRule,
    getRuleBySchemeId,
};
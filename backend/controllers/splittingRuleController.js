// backend/controllers/splittingRuleController.js
const SplittingRule = require('../models/SplittingRule');
const SavingsScheme = require('../models/SavingsScheme'); // Scheme existence check ke liye

// @desc    Create a new splitting rule
// @route   POST /api/rules
// @access  Private
const createRule = async (req, res) => {
    const { schemeId, percentage } = req.body; // Frontend se abhi bhi percentage aa rahi hai
    const userId = req.userId; // Middleware se user ID

    // Input validation
    if (!schemeId || percentage === undefined || percentage === null) {
        return res.status(400).json({ message: 'Scheme ID and percentage are required.' });
    }

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        return res.status(400).json({ message: 'Percentage must be a number between 1 and 100.' });
    }

    try {
        // Check if the scheme belongs to the user
        const schemeExists = await SavingsScheme.findOne({ _id: schemeId, userId });
        if (!schemeExists) {
            return res.status(404).json({ message: 'Scheme not found or does not belong to you.' });
        }

        // Check if a rule for this scheme already exists for the user
        const existingRule = await SplittingRule.findOne({ userId, schemeId });
        if (existingRule) {
            return res.status(400).json({ message: 'A splitting rule for this scheme already exists.' });
        }

        // Optional: Check if total percentage exceeds 100% (server-side validation)
        const userRules = await SplittingRule.find({ userId });
        const currentTotalPercentage = userRules.reduce((sum, rule) => sum + rule.value, 0); // Ab 'value' use kar rahe hain

        if (currentTotalPercentage + percentage > 100) {
            return res.status(400).json({ message: `Total splitting percentage cannot exceed 100%. Current total: ${currentTotalPercentage}%.` });
        }

        const rule = await SplittingRule.create({
            userId,
            schemeId,
            value: percentage, // 'percentage' ko 'value' field mein assign kiya
            splitType: 'percentage', // 'splitType' ko hardcode kiya
            // percentage: percentage, // Yeh field ab optional hai, ya hata sakte hain agar model mein required nahi hai
        });

        res.status(201).json({ message: 'Splitting rule created successfully', rule });
    } catch (error) {
        console.error('Error creating rule:', error.message);
        res.status(500).json({ message: 'Server error during rule creation.' });
    }
};

// @desc    Get all splitting rules for a user
// @route   GET /api/rules
// @access  Private
const getRules = async (req, res) => {
    try {
        // rules ko fetch karte waqt associated scheme ki details bhi populate karo
        const rules = await SplittingRule.find({ userId: req.userId })
            .populate('schemeId', 'schemeName'); // schemeId reference ko populate karo, aur sirf schemeName field lo

        res.status(200).json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error.message);
        res.status(500).json({ message: 'Server error while fetching rules.' });
    }
};

// @desc    Update a splitting rule
// @route   PUT /api/rules/:id
// @access  Private
const updateRule = async (req, res) => {
    const { percentage } = req.body; // Frontend se abhi bhi percentage aa rahi hai
    const ruleId = req.params.id;
    const userId = req.userId;

    if (percentage === undefined || percentage === null) {
        return res.status(400).json({ message: 'Percentage is required.' });
    }
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        return res.status(400).json({ message: 'Percentage must be a number between 1 and 100.' });
    }

    try {
        const rule = await SplittingRule.findOne({ _id: ruleId, userId });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found or does not belong to you.' });
        }

        // Optional: Check if total percentage exceeds 100% after update
        const userRules = await SplittingRule.find({ userId, _id: { $ne: ruleId } }); // Exclude current rule
        const currentTotalPercentage = userRules.reduce((sum, r) => sum + r.value, 0); // Ab 'value' use kar rahe hain

        if (currentTotalPercentage + percentage > 100) {
            return res.status(400).json({ message: `Total splitting percentage cannot exceed 100%. Current total (excluding this rule): ${currentTotalPercentage}%.` });
        }

        rule.value = percentage; // 'percentage' ko 'value' field mein update kiya
        // rule.percentage = percentage; // Yeh line ab optional hai
        const updatedRule = await rule.save();

        res.status(200).json({ message: 'Splitting rule updated successfully', rule: updatedRule });
    } catch (error) {
        console.error('Error updating rule:', error.message);
        res.status(500).json({ message: 'Server error during rule update.' });
    }
};

// @desc    Delete a splitting rule
// @route   DELETE /api/rules/:id
// @access  Private
const deleteRule = async (req, res) => {
    const ruleId = req.params.id;
    const userId = req.userId;

    try {
        const rule = await SplittingRule.findOneAndDelete({ _id: ruleId, userId });

        if (!rule) {
            return res.status(404).json({ message: 'Rule not found or does not belong to you.' });
        }

        res.status(200).json({ message: 'Splitting rule deleted successfully.' });
    } catch (error) {
        console.error('Error deleting rule:', error.message);
        res.status(500).json({ message: 'Server error during rule deletion.' });
    }
};

module.exports = {
    createRule,
    getRules,
    updateRule,
    deleteRule,
};
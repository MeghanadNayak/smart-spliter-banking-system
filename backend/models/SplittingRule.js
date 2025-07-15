// backend/models/SplittingRule.js
const mongoose = require('mongoose');

const splittingRuleSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // User model se link
    },
    schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SavingsScheme', // SavingsScheme model se link
    },
    // Hum 'value' aur 'splitType' ka use karenge, 'percentage' ko hata denge ya optional rakhenge
    // Kyunki error keh raha hai 'value' aur 'splitType' required hain
    value: { // Ye actual amount ya percentage value hogi
        type: Number,
        required: true, // Frontend se percentage aayegi
        min: 0,
    },
    splitType: { // Ye bataega ki value kya represent karti hai (e.g., 'percentage', 'fixed_amount')
        type: String,
        required: true,
        enum: ['percentage', 'fixed_amount'], // Possible values
        default: 'percentage', // Default to percentage for now
    },
    // 'percentage' field ab redundant ho gaya hai agar 'value' 'percentage' type ka hai.
    // Aap isko hata sakte hain ya optional bana sakte hain.
    // Hum filhaal isko rakhte hain but 'value' ko use karenge.
    percentage: { // Ye field ab pichle code ki compatibility ke liye rakha hai
        type: Number,
        min: 0,
        max: 100,
        // required: true, // Ab required nahi hai kyunki 'value' use hoga
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Pre-save hook to ensure 'percentage' and 'value' are consistent
splittingRuleSchema.pre('save', function(next) {
    if (this.splitType === 'percentage' && this.percentage !== undefined) {
        this.value = this.percentage; // percentage ko value mein copy karo
    }
    // Agar future mein fixed_amount hoga toh yahan handle karenge
    next();
});

module.exports = mongoose.model('SplittingRule', splittingRuleSchema);
// backend/models/SavingsScheme.js
const mongoose = require('mongoose');

const savingsSchemeSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    schemeName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    targetAmount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true, // Ye Mongoose ko createdAt aur updatedAt fields automatically add karne ke liye kehta hai
});

module.exports = mongoose.model('SavingsScheme', savingsSchemeSchema);
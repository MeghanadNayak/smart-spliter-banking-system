// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    type: { // 'deposit' or 'withdrawal'
        type: String,
        required: true,
        enum: ['deposit', 'withdrawal'],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        default: '',
    },
    // Agar yeh kisi scheme se जुड़ा transaction hai
    schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SavingsScheme',
        required: false, // Deposit ke liye nahi chahiye, withdrawal ke liye chahiye
    },
    // Agar yeh kisi sub-account se जुड़ा transaction hai
    subAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubAccount',
        required: false, // Main account deposit ke liye nahi
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false, // We use 'date' field explicitly
});

module.exports = mongoose.model('Transaction', transactionSchema);
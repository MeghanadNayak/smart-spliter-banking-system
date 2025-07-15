// backend/models/SubAccount.js
const mongoose = require('mongoose');

const subAccountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account',
    },
    schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SavingsScheme',
        unique: true,
    },
    subAccountName: {
        type: String,
        required: true,
        trim: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SubAccount', subAccountSchema);
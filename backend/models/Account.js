// backend/models/Account.js
const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true, // Har user ka ek hi main account hoga, ye sahi hai.
    },
    accountNumber: {
        type: String,
        // unique: true, // <-- YE LINE YAHAN SE PURI TARAH HATA DI GAYI HAI!
        // required: true, // Aap ise optional bhi rakh sakte hain agar aap ise generate nahi kar rahe hain
        sparse: true, // Agar value null ho to unique constraint ignore karne ke liye (ab iski utni zaroorat nahi padegi, lekin rehne dein)
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Account', accountSchema);
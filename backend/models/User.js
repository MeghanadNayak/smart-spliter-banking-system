// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Username abhi bhi unique rahega
        trim: true,
    },
    email: {
        type: String,
        // unique: true, // <-- Yeh line ab hata di gayi hai!
        trim: true,
        sparse: true, // Yeh property null values ko unique constraint se avoid karne mein madad karti hai
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
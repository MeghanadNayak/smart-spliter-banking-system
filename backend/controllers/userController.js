// backend/controllers/userController.js
const User = require('../models/User'); // User model ko import kiya hai
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account'); // Account model ko import kiya hai

// JWT (JSON Web Token) banane ke liye ek helper function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token ki validity 30 dinon ke liye set ki gayi hai
    });
};

// @desc    Ek naya user register karein
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    // req.body se username, email, aur password teeno nikalein
    const { username, email, password } = req.body;

    // Validation: Confirm karein ki sabhi zaroori fields bhare gaye hon
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        // Check karein ki username ya email pehle se exist toh nahi karte hain
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            // Better error message dein: bataayein ki username ya email pehle se taken hai
            if (user.username === username) {
                return res.status(400).json({ message: 'This username already exists.' });
            }
            if (user.email === email) {
                return res.status(400).json({ message: 'This email already exists' });
            }
        }

        // Password ko hash karein (security ke liye)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Naya user create karein aur email aur hashed password ko store karein
        user = await User.create({
            username,
            email, // email field ko yahan add kiya gaya hai
            password: hashedPassword,
        });

        // Naye user ke liye ek main account create karein (zaroori agar har user ka ek account ho)
        await Account.create({
            userId: user._id,
            balance: 0, // Initial balance 0 set kiya gaya hai
        });

        // Safalta ki response bhejein
        res.status(201).json({
            message: 'User registered successfully',
            _id: user.id,
            username: user.username,
            email: user.email, // Response mein email bhi shamil karein
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Error while registering the user:', error.message);
        res.status(500).json({ message: 'A server error occurred during registration' });
    }
};

// @desc    User ko authenticate karein aur token prapt karein
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // User ko username se khojein
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Password ki jaanch karein (hashed password se comparison)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Logged in successfully',
            _id: user.id,
            username: user.username,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Error while logging in the user:', error.message);
        res.status(500).json({ message: 'A server error occurred during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
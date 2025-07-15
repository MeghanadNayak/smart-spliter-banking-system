// backend/server.js
const express = require('express');
const dotenv = require('dotenv'); // dotenv import karein
const connectDB = require('./config/db'); // db.js se connectDB function import karein
const userRoutes = require('./routes/userRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cors = require('cors');

// Environment variables ko .env file se load karein
dotenv.config();

// Database se connect karein
connectDB();

const app = express();

// Middleware
app.use(express.json()); // JSON data ko parse karne ke liye
app.use(cors()); // CORS ko enable karein

// Routes
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/transactions', transactionRoutes);

// Server ki health check ke liye simple route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Older options like useCreateIndex and useFindAndModify are now deprecated
            // and are generally not needed with recent Mongoose versions.
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Agar connection fail ho toh application exit kar degi
    }
};

module.exports = connectDB;
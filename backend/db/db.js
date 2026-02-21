const mongoose = require('mongoose');

const db = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,  // Fail fast if Atlas is unreachable
            socketTimeoutMS: 45000,
            maxPoolSize: 10,                 // Reuse connections instead of creating new ones
        });
        console.log('Db Connected');
    } catch (error) {
        console.log('DB Connection Error:', error.message);
    }
}

module.exports = { db };
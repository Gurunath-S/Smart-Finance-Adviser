// utils/errorHandler.js
const handleServerError = (res, error, message = "Server error") => {
    console.error(`${message}:`, error);
    res.status(500).json({ message, error: error.message });
};

module.exports = { handleServerError };

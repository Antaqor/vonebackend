const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;  // Updated import

const UserSchema = new Schema({
    username: {  // Changed from name to username for consistency
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);  // Proper model initialization

module.exports = User;  // Export the User model
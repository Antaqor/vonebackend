const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'owner'] }
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
module.exports = User;
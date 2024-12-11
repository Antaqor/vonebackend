// server/models/User.js

import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: Buffer, // Stores binary image data
    },
    profilePictureType: {
        type: String, // Stores MIME type, e.g., 'image/png'
    },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
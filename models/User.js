import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profilePicture: { type: Buffer },
    profilePictureType: { type: String },
    role: {
        type: String,
        enum: ['user', 'stylist', 'admin'],
        default: 'user',
    },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;
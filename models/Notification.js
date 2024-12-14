import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const NotificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = models.Notification || model('Notification', NotificationSchema);
export default Notification;
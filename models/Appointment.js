import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const AppointmentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: String, required: true },
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'canceled'],
        default: 'pending',
    },
}, { timestamps: true });

const Appointment = models.Appointment || model('Appointment', AppointmentSchema);
export default Appointment;
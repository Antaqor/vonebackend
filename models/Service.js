const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const TimeBlockSchema = new Schema({
    label: { type: String },
    times: [{ type: String }],
});

const StylistBlockSchema = new Schema({
    stylist: { type: Schema.Types.ObjectId, ref: 'Stylist', default: null },
    timeBlocks: [TimeBlockSchema],
});

const ServiceSchema = new Schema({
    salon: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    stylistTimeBlocks: [StylistBlockSchema],
}, { timestamps: true });

const Service = models.Service || model('Service', ServiceSchema);
module.exports = Service;
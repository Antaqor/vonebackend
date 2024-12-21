const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const SalonSchema = new Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Salon = models.Salon || model('Salon', SalonSchema);
module.exports = Salon;
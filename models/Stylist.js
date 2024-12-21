const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const StylistSchema = new Schema({
    salon: { type: Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true },
}, { timestamps: true });

const Stylist = models.Stylist || model('Stylist', StylistSchema);
module.exports = Stylist;
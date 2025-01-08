// ==========================================
// models/Service.js (unchanged from your code)
// ==========================================
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const TimeBlockSchema = new Schema({
    date: { type: Date },
    label: { type: String, default: "Custom" },
    times: [{ type: String }],
});

const StylistBlockSchema = new Schema({
    stylist: { type: Schema.Types.ObjectId, ref: "Stylist", default: null },
    timeBlocks: [TimeBlockSchema],
});

const ServiceSchema = new Schema(
    {
        salon: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
        name: { type: String, required: true },
        durationMinutes: { type: Number, required: true },
        price: { type: Number, required: true },
        stylistTimeBlocks: [StylistBlockSchema],
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    },
    { timestamps: true }
);

const Service = models.Service || model("Service", ServiceSchema);
module.exports = Service;

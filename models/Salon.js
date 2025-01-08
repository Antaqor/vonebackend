// ==========================================
// models/Salon.js (unchanged from your code)
// ==========================================
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const SalonSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        location: { type: String, required: true },
        about: { type: String, default: "" },
        logo: { type: String, default: "" },
        coverImage: { type: String, default: "" },
        category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        hoursOfOperation: {
            type: Map,
            of: String,
            default: {},
        },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
    },
    { timestamps: true }
);

const Salon = models.Salon || model("Salon", SalonSchema);
module.exports = Salon;

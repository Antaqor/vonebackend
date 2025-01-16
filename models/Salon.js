// models/Salon.js
const mongooseSalon = require("mongoose");
const { Schema: SalonSchemaDef, model: salonModel, models: salonModels } = mongooseSalon;

const SalonSchema = new SalonSchemaDef(
    {
        name: { type: String, required: true, unique: true },
        location: { type: String, required: true },
        about: { type: String, default: "" },
        logo: { type: String, default: "" },
        coverImage: { type: String, default: "" },
        category: {
            type: SalonSchemaDef.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        owner: {
            type: SalonSchemaDef.Types.ObjectId,
            ref: "User",
            required: true,
        },
        hoursOfOperation: { type: Map, of: String, default: {} },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
    },
    { timestamps: true }
);

const Salon = salonModels.Salon || salonModel("Salon", SalonSchema);
module.exports = Salon;

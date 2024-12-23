// models/Service.js
const mongooseService = require("mongoose");
const { Schema: ServiceSchemaDef, model: serviceModel, models: serviceModels } = mongooseService;

const TimeBlockSchema = new ServiceSchemaDef({
    date: { type: Date },              // <--- newly added field for a specific date
    label: { type: String },           // e.g. "Morning", "Afternoon", etc.
    times: [{ type: String }],         // e.g. ["08:00 AM", "08:15 AM", ...]
});

const StylistBlockSchema = new ServiceSchemaDef({
    stylist: { type: ServiceSchemaDef.Types.ObjectId, ref: "Stylist", default: null },
    timeBlocks: [TimeBlockSchema],
});

const ServiceSchema = new ServiceSchemaDef(
    {
        salon: { type: ServiceSchemaDef.Types.ObjectId, ref: "Salon", required: true },
        name: { type: String, required: true },
        durationMinutes: { type: Number, required: true },
        price: { type: Number, required: true },
        stylistTimeBlocks: [StylistBlockSchema],
        category: { type: ServiceSchemaDef.Types.ObjectId, ref: "Category", default: null },
    },
    { timestamps: true }
);

const Service = serviceModels.Service || serviceModel("Service", ServiceSchema);
module.exports = Service;
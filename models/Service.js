const mongooseService = require("mongoose");
const { Schema: ServiceSchemaDef, model: serviceModel, models: serviceModels } =
    mongooseService;

const TimeBlockSchema = new ServiceSchemaDef({
    date: { type: Date },
    label: { type: String },
    times: [{ type: String }],
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

        // Link to Category. Example: category: "ObjectId('...')"
        category: {
            type: ServiceSchemaDef.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    },
    { timestamps: true }
);

const Service = serviceModels.Service || serviceModel("Service", ServiceSchema);
module.exports = Service;
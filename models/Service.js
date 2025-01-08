const mongooseSvc = require("mongoose");
const { Schema: SvcSchemaDef, model: svcModel, models: svcModels } = mongooseSvc;
const TimeBlockSchema = new SvcSchemaDef({ date: { type: Date }, label: { type: String, default: "Custom" }, times: [{ type: String }] });
const StylistBlockSchema = new SvcSchemaDef({ stylist: { type: SvcSchemaDef.Types.ObjectId, ref: "Stylist", default: null }, timeBlocks: [TimeBlockSchema] });
const ServiceSchema = new SvcSchemaDef({
    salon: { type: SvcSchemaDef.Types.ObjectId, ref: "Salon", required: true },
    name: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    stylistTimeBlocks: [StylistBlockSchema],
    category: { type: SvcSchemaDef.Types.ObjectId, ref: "Category", default: null },
},{ timestamps: true });
const Service = svcModels.Service || svcModel("Service", ServiceSchema);
module.exports = Service;
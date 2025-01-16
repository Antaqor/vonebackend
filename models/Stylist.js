const mongooseStylist = require("mongoose");
const {
    Schema: StylistSchemaDef,
    model: stylistModel,
    models: stylistModels,
} = mongooseStylist;

const StylistSchema = new StylistSchemaDef(
    {
        salon: { type: StylistSchemaDef.Types.ObjectId, ref: "Salon", required: true },
        name: { type: String, required: true },
    },
    { timestamps: true }
);

const Stylist =
    stylistModels.Stylist || stylistModel("Stylist", StylistSchema);

module.exports = Stylist;

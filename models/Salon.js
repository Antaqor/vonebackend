const mongooseSalon = require("mongoose");
const {
    Schema: SalonSchemaDef,
    model: salonModel,
    models: salonModels,
} = mongooseSalon;

const SalonSchema = new SalonSchemaDef(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
            required: true,
        },
        about: {
            type: String,
            default: "",
        },
        logo: {
            type: String,
            default: "",
        },
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
    },
    { timestamps: true }
);

const Salon = salonModels.Salon || salonModel("Salon", SalonSchema);
module.exports = Salon;
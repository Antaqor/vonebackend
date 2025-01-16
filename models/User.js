// models/User.js
const mongooseUsr = require("mongoose");
const { Schema: UserSchemaDef, model: userModel, models: userModels } = mongooseUsr;

const UserSchema = new UserSchemaDef(
    {
        username: { type: String },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            default: "user",
            enum: ["user", "owner", "stylist"],
        },
        appointments: [{ type: UserSchemaDef.Types.ObjectId, ref: "Appointment" }],

        // If stylists must pick exactly one assigned salon:
        assignedSalon: {
            type: UserSchemaDef.Types.ObjectId,
            ref: "Salon",
            default: null,
        },

        // `stylistStatus` = "pending", "approved", "rejected", "fired", or null
        stylistStatus: {
            type: String,
            enum: ["pending", "approved", "rejected", "fired", null],
            default: null,
        },
    },
    { timestamps: true }
);

const User = userModels.User || userModel("User", UserSchema);
module.exports = User;

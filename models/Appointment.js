// models/Appointment.js

const mongooseApt = require("mongoose");
const { Schema: AptSchemaDef, model: aptModel, models: aptModels } = mongooseApt;

const AppointmentSchema = new AptSchemaDef(
    {
            user: { type: AptSchemaDef.Types.ObjectId, ref: "User", required: true },
            service: { type: AptSchemaDef.Types.ObjectId, ref: "Service", required: true },
            stylist: { type: AptSchemaDef.Types.ObjectId, ref: "User", default: null },
            date: { type: Date, required: true },
            startTime: { type: String, required: true },
            status: { type: String, default: "confirmed" },

            // NEW: final price after subtracting 500₮ deposit
            price: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Appointment =
    aptModels.Appointment || aptModel("Appointment", AppointmentSchema);

module.exports = Appointment;

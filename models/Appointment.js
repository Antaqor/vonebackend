const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const AppointmentSchema = new Schema(
    {
            user: { type: Schema.Types.ObjectId, ref: "User", required: true },
            service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
            stylist: { type: Schema.Types.ObjectId, ref: "Stylist", default: null },
            date: { type: Date, required: true },
            startTime: { type: String, required: true },
            status: { type: String, default: "confirmed" },
    },
    { timestamps: true }
);

const Appointment =
    models.Appointment || model("Appointment", AppointmentSchema);
module.exports = Appointment;
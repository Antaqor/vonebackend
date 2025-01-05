// models/Appointment.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const AppointmentSchema = new Schema(
    {
            user: {
                    type: Schema.Types.ObjectId,
                    ref: "User", // normal user
                    required: true,
            },
            service: {
                    type: Schema.Types.ObjectId,
                    ref: "Service",
                    required: true,
            },

            // Instead of referencing a separate Stylist doc, reference the User doc for stylists
            stylist: {
                    type: Schema.Types.ObjectId,
                    ref: "User", // same "User" collection, but that user has role="stylist"
                    default: null,
            },

            date: { type: Date, required: true },
            startTime: { type: String, required: true },
            status: { type: String, default: "confirmed" },
    },
    { timestamps: true }
);

const Appointment = models.Appointment || model("Appointment", AppointmentSchema);
module.exports = Appointment;
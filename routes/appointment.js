// routes/appointment.js
const express = require("express");
const routerAppointment = express.Router();
const Appointment = require("../models/Appointment");
const authenticateToken = require("../middleware/authMiddleware");
const Salon = require("../models/Salon");
const Service = require("../models/Service");

// (1) CREATE an appointment (for any authenticated user)
routerAppointment.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId, status } = req.body;

        if (!serviceId || !date || !startTime) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const userId = req.user.id; // The authenticated user's ID

        // If stylistId is provided, it references a user with role="stylist"
        // If omitted, it remains null
        const appt = new Appointment({
            user: userId,
            service: serviceId,
            stylist: stylistId || null,
            date: new Date(date),
            startTime,
            status: status || "confirmed",
        });

        await appt.save();
        return res.status(201).json({
            message: "Appointment booked successfully!",
            appointment: appt,
        });
    } catch (err) {
        console.error("Error creating appointment:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (2) GET appointments
routerAppointment.get("/", authenticateToken, async (req, res) => {
    try {
        // A) If the requester is an OWNER => show all appointments for that owner's single salon
        if (req.user.role === "owner") {
            const salon = await Salon.findOne({ owner: req.user.id });
            if (!salon) {
                // If the owner has no salon, return empty
                return res.json([]);
            }

            // 1) Find services for that salon
            const services = await Service.find({ salon: salon._id });
            const serviceIds = services.map((s) => s._id);

            // 2) Return appointments for those service IDs
            const appts = await Appointment.find({ service: { $in: serviceIds } })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            // <-- 'stylist' references a user doc with role="stylist"

            return res.json(appts);
        }

        // B) If the requester is a STYLIST => show only appointments assigned to them
        if (req.user.role === "stylist") {
            // The 'stylist' field is a user ID with role="stylist"
            const appts = await Appointment.find({ stylist: req.user.id })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");

            return res.json(appts);
        }

        // C) If normal USER => show only that user's appointments
        const userId = req.user.id;
        const userAppts = await Appointment.find({ user: userId })
            .populate("service", "name")
            .populate("user", "username phoneNumber")
            .populate("stylist", "username phoneNumber");

        return res.json(userAppts);
    } catch (err) {
        console.error("Error fetching appointments:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerAppointment;
// /routes/appointment.js
const express = require("express");
const routerAppointment = express.Router();
const Appointment = require("../models/Appointment");
const authenticateToken = require("../middleware/authMiddleware");
const Service = require("../models/Service");
const Salon = require("../models/Salon");

/**
 * POST /api/appointments
 * Creates an appointment (any authenticated user).
 */
routerAppointment.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId, status } = req.body;
        if (!serviceId || !date || !startTime) {
            return res
                .status(400)
                .json({ error: "Missing fields: serviceId, date, startTime." });
        }

        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: "Invalid token: no user ID." });
        }

        // Check that the service actually exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: "Service not found." });
        }

        // Create appointment
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
        return res
            .status(500)
            .json({ error: "Server error creating appointment" });
    }
});

/**
 * GET /api/appointments
 * Different data returned for owner/stylist/normal user.
 */
routerAppointment.get("/", authenticateToken, async (req, res) => {
    try {
        // A) If OWNER => show all appts for that owner's single salon
        if (req.user.role === "owner") {
            const salon = await Salon.findOne({ owner: req.user.id });
            if (!salon) {
                return res.json([]);
            }
            const services = await Service.find({ salon: salon._id });
            const serviceIds = services.map((s) => s._id);

            const appts = await Appointment.find({ service: { $in: serviceIds } })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }

        // B) If STYLIST => show only assigned
        if (req.user.role === "stylist") {
            const appts = await Appointment.find({ stylist: req.user.id })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }

        // C) Normal user => their own
        const userId = req.user.id;
        const userAppts = await Appointment.find({ user: userId })
            .populate("service", "name")
            .populate("user", "username phoneNumber")
            .populate("stylist", "username phoneNumber");

        return res.json(userAppts);
    } catch (err) {
        console.error("Error fetching appointments:", err);
        return res.status(500).json({ error: "Server error fetching appointments" });
    }
});

module.exports = routerAppointment;

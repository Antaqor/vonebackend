// routes/appointment.js
const express = require("express");
const routerAppointment = express.Router();
const Appointment = require("../models/Appointment");
const authenticateToken = require("../middleware/authMiddleware");

// Create an appointment
routerAppointment.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId, status } = req.body;

        if (!serviceId || !date || !startTime) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const userId = req.user.id;

        const appt = new Appointment({
            user: userId,
            service: serviceId,
            stylist: stylistId || null,
            date: new Date(date),
            startTime,
            // Use the status from the request or default to "confirmed"
            status: status || "confirmed",
        });

        await appt.save();
        res.status(201).json({
            message: "Appointment booked successfully!",
            appointment: appt,
        });
    } catch (err) {
        console.error("Error creating appointment:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET appointments
routerAppointment.get("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId } = req.query;
        const filter = {};

        if (serviceId) {
            filter.service = serviceId;
        }

        const appts = await Appointment.find(filter)
            .populate("service")
            .populate("user", "username")
            .populate("stylist", "name");

        res.json(appts);
    } catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerAppointment;
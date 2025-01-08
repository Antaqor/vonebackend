// /routes/appointment.js
const expressAptRt = require("express");
const routerAppointment = expressAptRt.Router();
const AppointmentModel = require("../models/Appointment");
const authenticateToken = require("../middleware/authMiddleware");
const ServiceModel = require("../models/Service");
const SalonModel = require("../models/Salon");
routerAppointment.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId, status } = req.body;
        if (!serviceId || !date || !startTime) return res.status(400).json({ error: "Missing fields: serviceId, date, startTime." });
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ error: "Invalid token: no user ID." });
        const service = await ServiceModel.findById(serviceId);
        if (!service) return res.status(404).json({ error: "Service not found." });
        const appt = new AppointmentModel({
            user: userId,
            service: serviceId,
            stylist: stylistId || null,
            date: new Date(date),
            startTime,
            status: status || "confirmed",
        });
        await appt.save();
        return res.status(201).json({ message: "Appointment booked successfully!", appointment: appt });
    } catch (err) {
        return res.status(500).json({ error: "Server error creating appointment" });
    }
});
routerAppointment.get("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.role === "owner") {
            const salon = await SalonModel.findOne({ owner: req.user.id });
            if (!salon) return res.json([]);
            const services = await ServiceModel.find({ salon: salon._id });
            const serviceIds = services.map((s) => s._id);
            const appts = await AppointmentModel.find({ service: { $in: serviceIds } })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }
        if (req.user.role === "stylist") {
            const appts = await AppointmentModel.find({ stylist: req.user.id })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }
        const userId = req.user.id;
        const userAppts = await AppointmentModel.find({ user: userId })
            .populate("service", "name")
            .populate("user", "username phoneNumber")
            .populate("stylist", "username phoneNumber");
        return res.json(userAppts);
    } catch (err) {
        return res.status(500).json({ error: "Server error fetching appointments" });
    }
});
module.exports = routerAppointment;
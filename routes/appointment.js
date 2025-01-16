// routes/appointment.js
const expressAptRt = require("express");
const routerAppointment = expressAptRt.Router();
const authenticateToken = require("../middleware/authMiddleware");
const AppointmentModel = require("../models/Appointment");
const ServiceModel = require("../models/Service");
const SalonModel = require("../models/Salon");
const UserModel = require("../models/User");

routerAppointment.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId, status } = req.body;
        if (!serviceId || !date || !startTime) {
            return res.status(400).json({ error: "Missing fields: serviceId, date, startTime." });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: "Invalid token: no user ID." });
        }
        const service = await ServiceModel.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: "Service not found." });
        }

        // Create appointment
        const appt = new AppointmentModel({
            user: userId,
            service: serviceId,
            stylist: stylistId || null,
            date: new Date(date),
            startTime,
            status: status || "confirmed",
        });
        await appt.save();

        return res
            .status(201)
            .json({ message: "Appointment booked successfully!", appointment: appt });
    } catch (err) {
        console.error("Error creating appointment:", err);
        return res.status(500).json({ error: "Server error creating appointment" });
    }
});

/**
 * GET /api/appointments
 * - owner => see all in their salon
 * - stylist => only if stylistStatus="approved"
 * - user => only their own
 */
routerAppointment.get("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.role === "owner") {
            const salon = await SalonModel.findOne({ owner: req.user.id });
            if (!salon) {
                return res.json([]);
            }
            const services = await ServiceModel.find({ salon: salon._id });
            const serviceIds = services.map((s) => s._id);
            const appts = await AppointmentModel.find({ service: { $in: serviceIds } })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }

        if (req.user.role === "stylist") {
            const user = await UserModel.findById(req.user.id);
            if (!user || !user.assignedSalon || user.stylistStatus !== "approved") {
                return res.json([]);
            }
            const services = await ServiceModel.find({ salon: user.assignedSalon });
            const serviceIds = services.map((s) => s._id);
            const appts = await AppointmentModel.find({ service: { $in: serviceIds } })
                .populate("service", "name")
                .populate("user", "username phoneNumber")
                .populate("stylist", "username phoneNumber");
            return res.json(appts);
        }

        // role="user" => only their own
        const userId = req.user.id;
        const userAppts = await AppointmentModel.find({ user: userId })
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

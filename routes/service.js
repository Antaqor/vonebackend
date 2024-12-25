const expressService = require("express");
const routerService = expressService.Router();
const Service = require("../models/Service");
const Salon = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

// CREATE a new service
routerService.post("/my-service", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }
        const { name, durationMinutes, price, categoryId } = req.body;

        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: "No salon for this owner" });

        const newService = new Service({
            salon: salon._id,
            name,
            durationMinutes: durationMinutes || 30,
            price: price || 50,
            stylistTimeBlocks: [],
            // The crucial link to Category:
            category: categoryId || null,
        });
        await newService.save();
        return res.status(201).json(newService);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Add time block
routerService.post("/my-service/time-block", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ error: "Only owners" });

        const { serviceId, stylistId, date, label, times } = req.body;
        if (!serviceId || !date || !label || !Array.isArray(times)) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const service = await Service.findById(serviceId).populate("salon");
        if (!service) return res.status(404).json({ error: "Service not found" });

        // Ensure the owner matches the service's salon
        if (String(service.salon.owner) !== req.user.id) {
            return res.status(403).json({ error: "Not your salon" });
        }

        // Find or create the correct stylist block
        let foundBlock = service.stylistTimeBlocks.find((b) =>
            stylistId ? String(b.stylist) === String(stylistId) : !b.stylist
        );
        if (!foundBlock) {
            foundBlock = { stylist: stylistId || null, timeBlocks: [] };
            service.stylistTimeBlocks.push(foundBlock);
        }

        // Add new timeBlock
        foundBlock.timeBlocks.push({
            date: new Date(date),
            label,
            times,
        });

        await service.save();
        return res.status(201).json({ message: "Time block added successfully", service });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get all services for a given salon
routerService.get("/salon/:salonId", async (req, res) => {
    try {
        const services = await Service.find({ salon: req.params.salonId });
        return res.json(services);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get single service
routerService.get("/:serviceId", async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId).populate("salon");
        if (!service) return res.status(404).json({ error: "Service not found" });
        return res.json(service);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get availability
routerService.get("/:serviceId/availability", async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: "Missing date" });

        const service = await Service.findById(serviceId).populate({
            path: "stylistTimeBlocks.stylist",
            select: "name",
        });
        if (!service) return res.status(404).json({ error: "Service not found" });

        const requestedDate = new Date(date);
        const resultBlocks = [];

        for (const sb of service.stylistTimeBlocks) {
            const matchedTimeBlocks = sb.timeBlocks.filter((tb) => {
                const tbDate = new Date(tb.date);
                return tbDate.toDateString() === requestedDate.toDateString();
            });

            if (matchedTimeBlocks.length > 0) {
                resultBlocks.push({
                    stylist: sb.stylist,
                    timeBlocks: matchedTimeBlocks,
                });
            }
        }

        return res.json(resultBlocks);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET all services
 * (So your front-end can do axios.get("/api/services")
 *  and get an array of all services)
 */
routerService.get("/", async (req, res) => {
    try {
        const services = await Service.find().populate("salon");
        return res.json(services);
    } catch (err) {
        console.error("Error fetching all services:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerService;
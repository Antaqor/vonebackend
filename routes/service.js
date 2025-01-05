const express = require("express");
const routerService = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const Service = require("../models/Service");
const Salon = require("../models/Salon");
const Review = require("../models/Review");

// (1) CREATE SERVICE (owner only)
routerService.post("/my-service", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can create services" });
        }

        const { name, durationMinutes, price, categoryId } = req.body;
        // Find the salon for this owner
        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) {
            return res.status(404).json({ error: "No salon found for this owner" });
        }

        const newService = new Service({
            salon: salon._id,
            name,
            durationMinutes: durationMinutes || 30,
            price: price || 50,
            stylistTimeBlocks: [],
            category: categoryId || null,
        });

        await newService.save();
        return res.status(201).json(newService);
    } catch (err) {
        console.error("Error creating service:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (2) ADD TIME BLOCK (owner only)
routerService.post("/my-service/time-block", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can add time blocks" });
        }

        const { serviceId, stylistId, date, label, times } = req.body;
        if (!serviceId || !date || !label || !Array.isArray(times)) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const service = await Service.findById(serviceId).populate("salon");
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        // Verify service belongs to the same owner
        if (String(service.salon.owner) !== req.user.id) {
            return res.status(403).json({ error: "Not your salon" });
        }

        // Find or create correct stylist block
        let foundBlock = service.stylistTimeBlocks.find((b) =>
            stylistId ? String(b.stylist) === String(stylistId) : !b.stylist
        );
        if (!foundBlock) {
            foundBlock = { stylist: stylistId || null, timeBlocks: [] };
            service.stylistTimeBlocks.push(foundBlock);
        }

        // Add new time block
        foundBlock.timeBlocks.push({
            date: new Date(date),
            label,
            times,
        });

        await service.save();
        return res.status(201).json({ message: "Time block added", service });
    } catch (err) {
        console.error("Error adding time block:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (3) GET ALL SERVICES FOR A SALON (public)
routerService.get("/salon/:salonId", async (req, res) => {
    try {
        const services = await Service.find({ salon: req.params.salonId });
        return res.json(services);
    } catch (err) {
        console.error("Error fetching services:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (4) GET A SINGLE SERVICE (public)
routerService.get("/:serviceId", async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId).populate("salon");
        if (!service) return res.status(404).json({ error: "Service not found" });
        return res.json(service);
    } catch (err) {
        console.error("Error fetching single service:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (5) GET DAY-LEVEL AVAILABILITY
routerService.get("/:serviceId/availability", async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Missing date" });
        }

        const service = await Service.findById(serviceId).populate({
            path: "stylistTimeBlocks.stylist",
            select: "name",
        });
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        const requestedDate = new Date(date);
        const resultBlocks = [];

        // Filter only the matching date
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
        console.error("Error fetching availability:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (6) GET MONTH-BASED AVAILABILITY
routerService.get("/:serviceId/month-availability", async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ error: "Missing year or month" });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ error: "Service not found" });

        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const startOfMonth = new Date(yearNum, monthNum, 1);
        const endOfMonth = new Date(yearNum, monthNum + 1, 0);
        const totalDays = endOfMonth.getDate();

        const now = new Date();
        const days = [];
        for (let d = 1; d <= totalDays; d++) {
            const checkDate = new Date(yearNum, monthNum, d, 23, 59, 59);
            let status = "available";

            if (checkDate < now) {
                status = "past";
            } else if (Math.random() < 0.1) {
                status = "fullyBooked";
            } else if (Math.random() < 0.2) {
                status = "goingFast";
            }
            days.push({ day: d, status });
        }

        return res.json({
            year: yearNum,
            month: monthNum,
            days,
        });
    } catch (err) {
        console.error("Error fetching month-availability:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// (7) GET ALL SERVICES (public)
routerService.get("/", async (req, res) => {
    try {
        const services = await Service.find().populate("salon");
        if (!services.length) return res.json([]);

        // Collect IDs
        const serviceIds = services.map((s) => s._id);

        // Use MongoDB aggregate to compute avg rating, count per service
        const ratings = await Review.aggregate([
            { $match: { service: { $in: serviceIds } } },
            {
                $group: {
                    _id: "$service",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        const ratingMap = {};
        ratings.forEach((r) => {
            ratingMap[r._id.toString()] = {
                averageRating: r.averageRating,
                reviewCount: r.reviewCount,
            };
        });

        // Attach rating info to each service
        const finalServices = services.map((svc) => {
            const ratingInfo = ratingMap[svc._id.toString()] || { averageRating: 0, reviewCount: 0 };
            return {
                ...svc.toObject(),
                averageRating: ratingInfo.averageRating,
                reviewCount: ratingInfo.reviewCount,
            };
        });

        return res.json(finalServices);
    } catch (err) {
        console.error("Error fetching all services:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerService;
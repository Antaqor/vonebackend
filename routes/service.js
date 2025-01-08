// /routes/service.js
const expressSvc = require("express");
const routerService = expressSvc.Router();
const serviceAuth = require("../middleware/authMiddleware");
const ServiceMd = require("../models/Service");
const SalonMd = require("../models/Salon");
const ReviewMd = require("../models/Review");
routerService.post("/my-service", serviceAuth, async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ error: "Зөвхөн эзэмшигч үйлчилгээ үүсгэх боломжтой." });
        const { name, durationMinutes, price, categoryId } = req.body;
        const salon = await SalonMd.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: "Салон олдсонгүй. Эхлээд салон үүсгэнэ үү." });
        const newService = new ServiceMd({
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
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.post("/my-service/time-block", serviceAuth, async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ error: "Зөвхөн эзэмшигч цагийн блок нэмэх боломжтой." });
        const { serviceId, stylistId, date, times } = req.body;
        if (!serviceId || !date || !Array.isArray(times) || times.length === 0) return res.status(400).json({ error: "Шаардлагатай талбарууд дутуу байна." });
        const service = await ServiceMd.findById(serviceId).populate("salon");
        if (!service) return res.status(404).json({ error: "Үйлчилгээ олдсонгүй." });
        if (String(service.salon.owner) !== req.user.id) return res.status(403).json({ error: "Энэ таны салон биш байна." });
        let foundBlock = service.stylistTimeBlocks.find((b) => stylistId ? String(b.stylist) === String(stylistId) : !b.stylist);
        if (!foundBlock) {
            foundBlock = { stylist: stylistId || null, timeBlocks: [] };
            service.stylistTimeBlocks.push(foundBlock);
        }
        foundBlock.timeBlocks.push({ date: new Date(date), label: "Custom", times });
        await service.save();
        return res.status(201).json({ message: "Цагийн блок нэмлээ!", service });
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.get("/salon/:salonId", async (req, res) => {
    try {
        const services = await ServiceMd.find({ salon: req.params.salonId });
        return res.json(services);
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.get("/:serviceId", async (req, res) => {
    try {
        const service = await ServiceMd.findById(req.params.serviceId).populate("salon");
        if (!service) return res.status(404).json({ error: "Үйлчилгээ олдсонгүй" });
        return res.json(service);
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.get("/:serviceId/availability", async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: "Огноо алга." });
        const service = await ServiceMd.findById(serviceId).populate({ path: "stylistTimeBlocks.stylist", select: "name" });
        if (!service) return res.status(404).json({ error: "Үйлчилгээ олдсонгүй." });
        const requestedDate = new Date(date);
        const resultBlocks = [];
        for (const sb of service.stylistTimeBlocks) {
            const matchedTimeBlocks = sb.timeBlocks.filter((tb) => {
                const tbDate = new Date(tb.date);
                return tbDate.toDateString() === requestedDate.toDateString();
            });
            if (matchedTimeBlocks.length > 0) {
                const combinedTimes = matchedTimeBlocks.flatMap((tb) => tb.times || []);
                resultBlocks.push({ stylist: sb.stylist, times: combinedTimes });
            }
        }
        return res.json(resultBlocks);
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.get("/:serviceId/month-availability", async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { year, month } = req.query;
        if (!year || !month) return res.status(400).json({ error: "Жил, сар сонгоно уу." });
        const service = await ServiceMd.findById(serviceId);
        if (!service) return res.status(404).json({ error: "Үйлчилгээ олдсонгүй." });
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
            if (checkDate < now) status = "past";
            else if (Math.random() < 0.1) status = "fullyBooked";
            else if (Math.random() < 0.2) status = "goingFast";
            days.push({ day: d, status });
        }
        return res.json({ year: yearNum, month: monthNum, days });
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
routerService.get("/", async (req, res) => {
    try {
        const services = await ServiceMd.find().populate("salon");
        if (!services.length) return res.json([]);
        const serviceIds = services.map((s) => s._id);
        const Review = require("../models/Review");
        const ratings = await Review.aggregate([
            { $match: { service: { $in: serviceIds } } },
            { $group: { _id: "$service", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
        ]);
        const ratingMap = {};
        ratings.forEach((r) => {
            ratingMap[r._id.toString()] = { averageRating: r.averageRating, reviewCount: r.reviewCount };
        });
        const finalServices = services.map((svc) => {
            const ratingInfo = ratingMap[svc._id.toString()] || { averageRating: 0, reviewCount: 0 };
            return { ...svc.toObject(), averageRating: ratingInfo.averageRating, reviewCount: ratingInfo.reviewCount };
        });
        return res.json(finalServices);
    } catch (err) {
        return res.status(500).json({ error: "Серверийн алдаа" });
    }
});
module.exports = routerService;
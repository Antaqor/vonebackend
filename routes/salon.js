// /routes/salon.js
const expressSalon = require("express");
const routerSalon = expressSalon.Router();
const SalonModel = require("../models/Salon");
const salonAuth = require("../middleware/authMiddleware");
routerSalon.post("/my-salon", salonAuth, async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ error: "Only owners" });
        const { name, location, about, logo, coverImage, categoryId, hoursOfOperation, lat, lng } = req.body;
        if (!name || !location) return res.status(400).json({ error: "Missing required fields: 'name'/'location'" });
        let salon = await SalonModel.findOne({ owner: req.user.id });
        if (salon) {
            salon.name = name;
            salon.location = location;
            salon.about = about || "";
            salon.logo = logo || "";
            salon.coverImage = coverImage || "";
            salon.category = categoryId || null;
            if (hoursOfOperation) salon.hoursOfOperation = hoursOfOperation;
            if (lat !== undefined) salon.lat = lat;
            if (lng !== undefined) salon.lng = lng;
            await salon.save();
            return res.status(200).json(salon);
        } else {
            const newSalon = new SalonModel({
                name, location, about: about || "", logo: logo || "", coverImage: coverImage || "",
                category: categoryId || null, owner: req.user.id, hoursOfOperation: hoursOfOperation || {}, lat: lat || null, lng: lng || null,
            });
            await newSalon.save();
            return res.status(201).json(newSalon);
        }
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});
routerSalon.get("/my-salon", salonAuth, async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ error: "Only owners" });
        const salon = await SalonModel.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: "No salon found" });
        return res.json(salon);
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});
routerSalon.get("/", async (req, res) => {
    try {
        const salons = await SalonModel.find();
        return res.json(salons);
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});
routerSalon.get("/:id", async (req, res) => {
    try {
        const salon = await SalonModel.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: "Salon not found" });
        return res.json(salon);
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});
module.exports = routerSalon;
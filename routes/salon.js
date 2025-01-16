// routes/salon.js
const expressSalon = require("express");
const routerSalon = expressSalon.Router();
const SalonModel = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * POST /api/salons/my-salon
 * Create or update an owner’s salon
 */
routerSalon.post("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can create/update salons" });
        }

        const {
            name,
            location,
            about,
            logo,
            coverImage,
            categoryId,
            hoursOfOperation,
            lat,
            lng,
        } = req.body;

        if (!name || !location) {
            return res
                .status(400)
                .json({ error: "Missing required fields: 'name'/'location'" });
        }

        let salon = await SalonModel.findOne({ owner: req.user.id });

        // Update existing
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
        }

        // Otherwise create new
        const newSalon = new SalonModel({
            name,
            location,
            about: about || "",
            logo: logo || "",
            coverImage: coverImage || "",
            category: categoryId || null,
            owner: req.user.id,
            hoursOfOperation: hoursOfOperation || {},
            lat: lat || null,
            lng: lng || null,
        });
        await newSalon.save();
        return res.status(201).json(newSalon);
    } catch (err) {
        console.error("Error in POST /my-salon:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/salons/my-salon
 * Only owners see their own salon
 */
routerSalon.get("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }
        const salon = await SalonModel.findOne({ owner: req.user.id });
        if (!salon) {
            return res.status(404).json({ error: "No salon found" });
        }
        return res.json(salon);
    } catch (err) {
        console.error("Error in GET /my-salon:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/salons
 * Public list of all salons
 */
routerSalon.get("/", async (req, res) => {
    try {
        const salons = await SalonModel.find();
        return res.json(salons);
    } catch (err) {
        console.error("Error in GET /salons:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/salons/:id
 * Public fetch a single salon
 */
routerSalon.get("/:id", async (req, res) => {
    try {
        const salon = await SalonModel.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: "Salon not found" });
        }
        return res.json(salon);
    } catch (err) {
        console.error("Error in GET /salons/:id:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerSalon;

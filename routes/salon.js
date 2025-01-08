const express = require("express");
const routerSalon = express.Router();
const Salon = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * POST /api/salons/my-salon
 * Creates or updates the owner’s salon.
 */
routerSalon.post("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
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

        // Find existing salon for this user (owner)
        let salon = await Salon.findOne({ owner: req.user.id });

        if (salon) {
            // Update existing
            salon.name = name;
            salon.location = location;
            salon.about = about || "";
            salon.logo = logo || "";
            salon.coverImage = coverImage || "";
            salon.category = categoryId || null;

            // If we have hoursOfOperation, replace/merge:
            if (hoursOfOperation) {
                salon.hoursOfOperation = hoursOfOperation;
            }

            if (lat !== undefined) {
                salon.lat = lat;
            }
            if (lng !== undefined) {
                salon.lng = lng;
            }

            await salon.save();
            return res.status(200).json(salon);
        } else {
            // Create new
            const newSalon = new Salon({
                name,
                location,
                about: about || "",
                logo: logo || "",
                coverImage: coverImage || "",
                category: categoryId || null,
                owner: req.user.id,
                hoursOfOperation: hoursOfOperation || {},
                lat: lat !== undefined ? lat : null,
                lng: lng !== undefined ? lng : null,
            });

            await newSalon.save();
            return res.status(201).json(newSalon);
        }
    } catch (err) {
        console.error("Error in POST /my-salon:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/salons/my-salon
 * Fetch the salon belonging to the authenticated owner.
 */
routerSalon.get("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }

        const salon = await Salon.findOne({ owner: req.user.id });
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
 * Public route: fetch all salons.
 */
routerSalon.get("/", async (req, res) => {
    try {
        const salons = await Salon.find();
        return res.json(salons);
    } catch (err) {
        console.error("Error fetching salons:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/salons/:id
 * Public route: fetch a single salon by ID.
 */
routerSalon.get("/:id", async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ error: "Salon not found" });
        }
        return res.json(salon);
    } catch (err) {
        console.error("Error fetching single salon:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerSalon;
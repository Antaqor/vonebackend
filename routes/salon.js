// routes/salon.js
// ===============================================================
const expressSalon = require("express");
const routerSalon = expressSalon.Router();
const Salon = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

// Create or update the owner's salon
routerSalon.post("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }
        const { name, location } = req.body;
        if (!name || !location) {
            return res.status(400).json({ error: "Missing name/location" });
        }
        let salon = await Salon.findOne({ owner: req.user.id });
        if (salon) {
            salon.name = name;
            salon.location = location;
            await salon.save();
            return res.status(200).json(salon);
        } else {
            const newSalon = new Salon({
                name,
                location,
                owner: req.user.id,
            });
            await newSalon.save();
            return res.status(201).json(newSalon);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get the owner's salon
routerSalon.get("/my-salon", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }
        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: "No salon found" });
        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Public route: get all salons
routerSalon.get("/", async (req, res) => {
    try {
        const salons = await Salon.find();
        res.json(salons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Public route: get a single salon
routerSalon.get("/:id", async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: "Salon not found" });
        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerSalon;

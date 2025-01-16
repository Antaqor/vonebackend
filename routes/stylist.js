const expressStylist = require("express");
const routerStylist = expressStylist.Router();
const Stylist = require("../models/Stylist");
const Salon = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * POST /api/stylists/my-stylist
 * Only owners can create stylists for their salon.
 */
routerStylist.post("/my-stylist", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can create stylists" });
        }

        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Missing name" });
        }

        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) {
            return res.status(404).json({ error: "Owner has no salon" });
        }

        const stylist = new Stylist({ salon: salon._id, name });
        await stylist.save();

        return res.status(201).json(stylist);
    } catch (err) {
        console.error("Error creating stylist:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/stylists/salon/:salonId
 */
routerStylist.get("/salon/:salonId", async (req, res) => {
    try {
        const stylists = await Stylist.find({ salon: req.params.salonId });
        return res.json(stylists);
    } catch (err) {
        console.error("Error fetching stylists:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerStylist;

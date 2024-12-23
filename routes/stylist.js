// routes/stylist.js
// ===============================================================
const expressStylist = require("express");
const routerStylist = expressStylist.Router();
const Stylist = require("../models/Stylist");
const Salon = require("../models/Salon");
const authenticateToken = require("../middleware/authMiddleware");

routerStylist.post("/my-stylist", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners" });
        }
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Missing name" });
        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: "Owner has no salon" });
        const stylist = new Stylist({ salon: salon._id, name });
        await stylist.save();
        res.status(201).json(stylist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

routerStylist.get("/salon/:salonId", async (req, res) => {
    try {
        const stylists = await Stylist.find({ salon: req.params.salonId });
        res.json(stylists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerStylist;
// routes/stylist.js
const expressStylist = require("express");
const routerStylist = expressStylist.Router();
const authenticateToken = require("../middleware/authMiddleware");
const UserModel = require("../models/User");
const SalonModel = require("../models/Salon");

/**
 * GET /api/stylists/pending
 * stylists => assignedSalon=ownerSalon & stylistStatus="pending"
 */
routerStylist.get("/pending", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res
                .status(403)
                .json({ error: "Only owners can see pending stylists." });
        }
        const ownerSalon = await SalonModel.findOne({ owner: req.user.id });
        if (!ownerSalon) return res.json([]);

        const pendingStylists = await UserModel.find({
            role: "stylist",
            assignedSalon: ownerSalon._id,
            stylistStatus: "pending",
        }).select("username email phoneNumber stylistStatus");

        return res.json(pendingStylists);
    } catch (err) {
        console.error("Error fetching pending stylists:", err);
        return res.status(500).json({ error: "Server error fetching pending stylists" });
    }
});

/**
 * POST /api/stylists/approve => set "approved"
 */
routerStylist.post("/approve", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res
                .status(403)
                .json({ error: "Only owners can approve stylists." });
        }
        const { stylistId } = req.body;
        if (!stylistId) {
            return res.status(400).json({ error: "Missing stylistId" });
        }
        const stylistUser = await UserModel.findById(stylistId);
        if (!stylistUser || stylistUser.role !== "stylist") {
            return res.status(404).json({ error: "Stylist not found" });
        }
        const ownerSalon = await SalonModel.findOne({ owner: req.user.id });
        if (!ownerSalon) {
            return res.status(403).json({ error: "No salon found for this owner" });
        }
        if (
            !stylistUser.assignedSalon ||
            !stylistUser.assignedSalon.equals(ownerSalon._id)
        ) {
            return res
                .status(403)
                .json({ error: "This stylist is not assigned to your salon" });
        }

        stylistUser.stylistStatus = "approved";
        await stylistUser.save();
        return res.json({ message: "Stylist approved successfully" });
    } catch (err) {
        console.error("Error approving stylist:", err);
        return res.status(500).json({ error: "Server error approving stylist." });
    }
});

/**
 * For "reject" if you want:
 * POST /api/stylists/reject => set "rejected"
 */
routerStylist.post("/reject", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res
                .status(403)
                .json({ error: "Only owners can reject stylists." });
        }
        const { stylistId } = req.body;
        if (!stylistId) {
            return res.status(400).json({ error: "Missing stylistId" });
        }
        const stylistUser = await UserModel.findById(stylistId);
        if (!stylistUser || stylistUser.role !== "stylist") {
            return res.status(404).json({ error: "Stylist not found" });
        }
        const ownerSalon = await SalonModel.findOne({ owner: req.user.id });
        if (!ownerSalon) {
            return res.status(403).json({ error: "No salon found for this owner" });
        }
        if (
            !stylistUser.assignedSalon ||
            !stylistUser.assignedSalon.equals(ownerSalon._id)
        ) {
            return res
                .status(403)
                .json({ error: "Stylist is not assigned to your salon" });
        }

        stylistUser.stylistStatus = "rejected";
        stylistUser.assignedSalon = null; // remove them from the salon
        await stylistUser.save();
        return res.json({ message: "Stylist rejected successfully" });
    } catch (err) {
        console.error("Error rejecting stylist:", err);
        return res.status(500).json({ error: "Server error rejecting stylist." });
    }
});

/**
 * GET /api/stylists/team => all "approved" stylists for the owner
 */
routerStylist.get("/team", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can view their team." });
        }

        const ownerSalon = await SalonModel.findOne({ owner: req.user.id });
        if (!ownerSalon) {
            return res.status(404).json({ error: "No salon found for this owner." });
        }

        const stylists = await UserModel.find({
            role: "stylist",
            assignedSalon: ownerSalon._id,
            stylistStatus: "approved",
        }).select("username email phoneNumber stylistStatus assignedSalon");

        return res.json(stylists);
    } catch (err) {
        console.error("Error fetching team stylists:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/stylists/fire => assignedSalon=null, stylistStatus="fired"
 */
routerStylist.post("/fire", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res
                .status(403)
                .json({ error: "Only owners can fire stylists from their salon." });
        }
        const { stylistId } = req.body;
        if (!stylistId) {
            return res.status(400).json({ error: "Missing stylistId" });
        }

        const stylistUser = await UserModel.findById(stylistId);
        if (!stylistUser || stylistUser.role !== "stylist") {
            return res.status(404).json({ error: "Stylist user not found." });
        }

        const ownerSalon = await SalonModel.findOne({ owner: req.user.id });
        if (!ownerSalon) {
            return res.status(403).json({ error: "You have no salon to manage." });
        }
        if (
            !stylistUser.assignedSalon ||
            !stylistUser.assignedSalon.equals(ownerSalon._id)
        ) {
            return res
                .status(403)
                .json({ error: "This stylist is not assigned to your salon." });
        }

        stylistUser.assignedSalon = null;
        stylistUser.stylistStatus = "fired";
        await stylistUser.save();

        return res.json({ message: "Stylist has been fired successfully." });
    } catch (err) {
        console.error("Error firing stylist:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerStylist;

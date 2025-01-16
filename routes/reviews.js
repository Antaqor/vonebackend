const expressReviews = require("express");
const routerReviews = expressReviews.Router();
const Review = require("../models/Review");
const Service = require("../models/Service");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * Example: POST /api/reviews
 */
routerReviews.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, rating, comment } = req.body;
        if (!serviceId || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Optionally verify the service
        const svc = await Service.findById(serviceId);
        if (!svc) {
            return res.status(404).json({ error: "Service not found" });
        }

        const newReview = new Review({
            service: serviceId,
            user: req.user.id,
            rating,
            comment: comment || "",
        });
        await newReview.save();

        return res.status(201).json(newReview);
    } catch (err) {
        console.error("Error creating review:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerReviews;

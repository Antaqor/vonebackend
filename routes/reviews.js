const expressReviews = require("express");
const routerReviews = expressReviews.Router();
const Review = require("../models/Review");
const Service = require("../models/Service");
const authenticateToken = require("../middleware/authMiddleware");

// Create or update your review routes as needed...
// Example: POST /api/reviews
routerReviews.post("/", authenticateToken, async (req, res) => {
    try {
        const { serviceId, rating, comment } = req.body;
        if (!serviceId || !rating) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Possibly ensure user hasn't reviewed service multiple times, etc.
        const newReview = new Review({
            service: serviceId,
            user: req.user.id,
            rating,
            comment: comment || "",
        });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerReviews;
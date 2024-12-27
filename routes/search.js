// routes/search.js
const express = require("express");
const routerSearch = express.Router();
const Service = require("../models/Service");
const Review = require("../models/Review"); // Make sure you import your Review model

routerSearch.get("/", async (req, res) => {
    try {
        const { term, categoryId } = req.query;

        // Build a "filters" object
        const filters = {};

        // 1) Optional text match on "name"
        if (term) {
            filters.name = { $regex: new RegExp(term, "i") };
        }
        // 2) If user picked a category
        if (categoryId) {
            filters.category = categoryId;
        }

        // Fetch the services matching the filters
        const services = await Service.find(filters).populate("salon");

        // If no services found, just return an empty array
        if (!services.length) {
            return res.json([]);
        }

        // Gather their IDs
        const serviceIds = services.map((svc) => svc._id);

        // Now use Review collection to compute average rating and count
        const ratingData = await Review.aggregate([
            { $match: { service: { $in: serviceIds } } },
            {
                $group: {
                    _id: "$service",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        // Turn that into a map for quick lookup
        const ratingMap = {};
        ratingData.forEach((r) => {
            ratingMap[r._id.toString()] = {
                averageRating: r.averageRating,
                reviewCount: r.reviewCount,
            };
        });

        // Attach the rating info to each service
        const finalServices = services.map((svc) => {
            const ratingInfo = ratingMap[svc._id.toString()] || {
                averageRating: 0,
                reviewCount: 0,
            };
            return {
                ...svc.toObject(),
                averageRating: ratingInfo.averageRating,
                reviewCount: ratingInfo.reviewCount,
            };
        });

        return res.json(finalServices);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerSearch;
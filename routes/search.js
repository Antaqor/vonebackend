const express = require("express");
const routerSearch = express.Router();
const Service = require("../models/Service");
const Review = require("../models/Review");

/**
 * GET /api/search?term=...&categoryId=...
 */
routerSearch.get("/", async (req, res) => {
    try {
        const { term, categoryId } = req.query;
        const filters = {};

        if (term) {
            filters.name = { $regex: new RegExp(term, "i") };
        }
        if (categoryId) {
            filters.category = categoryId;
        }

        // 1) Find matching services
        const services = await Service.find(filters).populate("salon");

        if (!services.length) {
            return res.json([]);
        }

        // 2) Gather service IDs
        const serviceIds = services.map((svc) => svc._id);

        // 3) Aggregate reviews for average rating
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

        const ratingMap = {};
        ratingData.forEach((r) => {
            ratingMap[r._id.toString()] = {
                averageRating: r.averageRating,
                reviewCount: r.reviewCount,
            };
        });

        // 4) Combine rating info with each service
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
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerSearch;

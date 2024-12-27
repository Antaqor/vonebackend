const express = require("express");
const routerReviews = express.Router();     // <-- 1) Create the router
const authenticateToken = require("../middleware/authMiddleware");

const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");

// POST: create a new review
routerReviews.post("/", authenticateToken, async (req, res) => {
    try {
        // ...
    } catch (err) {
        // ...
    }
});

// GET: list all reviews for a particular service
routerReviews.get("/service/:serviceId", async (req, res) => {
    try {
        // ...
    } catch (err) {
        // ...
    }
});

// Finally, export your router
module.exports = routerReviews;
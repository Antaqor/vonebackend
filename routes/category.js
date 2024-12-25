const expressCategory = require("express");
const routerCategory = expressCategory.Router();
const Category = require("../models/Category");
const Service = require("../models/Service");
const authenticateToken = require("../middleware/authMiddleware");

// Create a new category
routerCategory.post("/", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can create categories" });
        }
        const { name, subServices } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Missing category name" });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const newCategory = new Category({
            name,
            subServices: Array.isArray(subServices) ? subServices : [],
        });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all categories
routerCategory.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get single category
routerCategory.get("/:categoryId", async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get services for a specific category
routerCategory.get("/:categoryId/services", async (req, res) => {
    try {
        const { categoryId } = req.params;
        const services = await Service.find({ category: categoryId }).populate("salon");
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerCategory;
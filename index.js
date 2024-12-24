// server.js
require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const Category = require("./models/Category");

// Route imports
const authRoutes = require("./routes/auth");
const salonRoutes = require("./routes/salon");
const serviceRoutes = require("./routes/service");
const stylistRoutes = require("./routes/stylist");
const appointmentRoutes = require("./routes/appointment");
const categoryRoutes = require("./routes/category");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://206.189.80.118' }));
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        // Seed categories after a successful connection
        await seedCategories();
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Example function to populate default categories if they don't exist
async function seedCategories() {
    const defaultCategories = [
        {
            name: "Hair",
            subServices: ["Cut", "Color", "Highlights"],
        },
        {
            name: "Barber",
            subServices: ["Haircut", "Beard Trim"],
        },
        {
            name: "Nail",
            subServices: ["Manicure", "Pedicure", "Gel Polish"],
        },
        {
            name: "Beauty",
            subServices: ["Facial", "Makeup", "Skincare"],
        },
        {
            name: "Lash",
            subServices: ["Classic Extensions", "Volume Extensions"],
        },
        {
            name: "Tattoo",
            subServices: ["Small Tattoo", "Large Tattoo", "Touch-up"],
        },
        // Add as many as you want...
    ];

    for (const cat of defaultCategories) {
        const existing = await Category.findOne({ name: cat.name });
        if (!existing) {
            await Category.create(cat);
            console.log(`Seeded category: ${cat.name}`);
        }
    }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stylists", stylistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.send("Server is working! 1");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
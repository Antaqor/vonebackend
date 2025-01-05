require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models (some might not be used directly here, but ensuring they’re required/initialized)
const Category = require("./models/Category");

// Routes
const authRoutes = require("./routes/auth");
const salonRoutes = require("./routes/salon");
const serviceRoutes = require("./routes/service");
const stylistRoutes = require("./routes/stylist");
const appointmentRoutes = require("./routes/appointment");
const categoryRoutes = require("./routes/category");
const searchRoutes = require("./routes/search");
const reviewsRoutes = require("./routes/reviews");

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: ['http://206.189.80.118', 'http://152.42.202.14']
}));
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        // Optionally seed default categories
        await seedCategories();
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Example seeding function
async function seedCategories() {
    const defaultCategories = [
        { name: "Hair",   subServices: ["Cut", "Color", "Highlights"] },
        { name: "Barber", subServices: ["Haircut", "Beard Trim"] },
        { name: "Nail",   subServices: ["Manicure", "Pedicure", "Gel Polish"] },
        { name: "Beauty", subServices: ["Facial", "Makeup", "Skincare"] },
        { name: "Lash",   subServices: ["Classic Extensions", "Volume Extensions"] },
        { name: "Tattoo", subServices: ["Small Tattoo", "Large Tattoo", "Touch-up"] },
    ];

    for (const cat of defaultCategories) {
        const existing = await Category.findOne({ name: cat.name });
        if (!existing) {
            await Category.create(cat);
            console.log(`Seeded category: ${cat.name}`);
        }
    }
}

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stylists", stylistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewsRoutes);

// Simple test route
app.get("/", (req, res) => {
    res.send("Server is working!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
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
const paymentRoutes = require("./routes/payment");
const notificationsRoute = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
    cors({
        origin: [
            "https://foru.mn",
            "http://128.199.231.254",
            "http://68.183.191.149",
            "http://localhost:3000",
        ],
    })
);

app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false, // Not necessary in Mongoose v6+
        // useCreateIndex: true,    // Same as above
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        await seedCategories(); // optional seeding
    })
    .catch((err) => {
        console.error("MongoDB error:", err);
    });

async function seedCategories() {
    const defaultCategories = [
        { name: "Үс арчилгаа", subServices: ["Cut", "Color", "Highlights"] },
        { name: "Эрэгтэй үс", subServices: ["Haircut", "Beard Trim"] },
        { name: "Нүүр будалт", subServices: ["Haircut", "Beard Trim"] },
        { name: "Сормууё", subServices: ["Manicure", "Pedicure", "Gel Polish"] },
        { name: "Гоо сайхан", subServices: ["Facial", "Makeup", "Skincare"] },
        { name: "Хумс", subServices: ["Classic Extensions", "Volume Extensions"] },
        { name: "Шивээс", subServices: ["Small Tattoo", "Large Tattoo", "Touch-up"] },
    ];

    for (const cat of defaultCategories) {
        const existing = await Category.findOne({ name: cat.name });
        if (!existing) {
            await Category.create(cat);
            console.log(`Seeded category: ${cat.name}`);
        }
    }
}
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stylists", stylistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationsRoute);

app.get("/", (req, res) => res.send("Server is working!"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

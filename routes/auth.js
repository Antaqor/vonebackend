// routes/auth.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/User");
const SalonModel = require("../models/Salon");

// Basic validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhoneNumber(phone) {
    return /^[0-9]{8,12}$/.test(phone);
}

/**
 * POST /api/auth/register
 * If role="owner" => create new salon
 * If role="stylist" => assignedSalon=..., stylistStatus="pending"
 */
router.post("/register", async (req, res) => {
    try {
        const {
            username,
            email,
            phoneNumber,
            password,
            role,
            // For owners
            salonName,
            salonLogo,
            categoryId,
            // For stylists
            selectedSalonId,
        } = req.body;

        // Basic checks
        if (!username || !email || !phoneNumber || !password) {
            return res
                .status(400)
                .json({ error: "Required fields: username, email, phoneNumber, password." });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "Invalid phone number format." });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existingUser) {
            return res.status(400).json({ error: "Username/Email/Phone in use" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object
        const newUser = new UserModel({
            username: username.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            password: hashedPassword,
            role: role === "owner" || role === "stylist" ? role : "user",
        });

        // If owner => create new salon
        if (newUser.role === "owner" && salonName) {
            const newSalon = new SalonModel({
                owner: newUser._id,
                name: salonName.trim(),
                logo: salonLogo || "",
                category: categoryId || null,
                location: "No address yet", // or prompt from user
            });
            await newSalon.save();
        }

        // If stylist => assignedSalon & stylistStatus="pending"
        if (newUser.role === "stylist" && selectedSalonId) {
            const existingSalon = await SalonModel.findById(selectedSalonId);
            if (!existingSalon) {
                return res.status(404).json({ error: "Selected salon does not exist" });
            }
            newUser.assignedSalon = selectedSalonId;
            newUser.stylistStatus = "pending";
        }

        // Save user
        await newUser.save();
        return res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Server error during registration." });
    }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || "change-me",
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error during login." });
    }
});

module.exports = router;

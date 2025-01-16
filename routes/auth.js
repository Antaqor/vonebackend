require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/User");
const SalonModel = require("../models/Salon");

/**
 * Utility function: validateEmail, phone, etc.
 * You can adapt or remove these if you have a better approach.
 */
function isValidEmail(email) {
    // Very basic check; consider using a library like validator.js
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhoneNumber(phone) {
    // Basic rule: only digits, 8-12 in length, for example
    return /^[0-9]{8,12}$/.test(phone);
}

/**
 * POST /api/auth/register
 * Creates a new user. If `role="owner"`, also creates a new salon. If `role="stylist"`, links user to an existing salon.
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

        // 1) Basic checks
        if (!username || !email || !phoneNumber || !password) {
            return res.status(400).json({
                error: "Required fields: username, email, phoneNumber, password.",
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "Invalid phone number format." });
        }

        // 2) Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existingUser) {
            return res.status(400).json({ error: "Username/Email/Phone in use" });
        }

        // 3) Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4) Prepare the user
        const newUser = new UserModel({
            username: username.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            password: hashedPassword,
            role: role === "owner" || role === "stylist" ? role : "user",
        });

        // 5) If role is "owner", create salon
        if (newUser.role === "owner" && salonName) {
            const newSalon = new SalonModel({
                owner: newUser._id,
                name: salonName.trim(),
                logo: salonLogo || "",
                category: categoryId || null,
                location: "No address yet", // or a required field from user
            });
            await newSalon.save();
        }

        // 6) If role is "stylist", link to existing salon
        if (newUser.role === "stylist" && selectedSalonId) {
            const existingSalon = await SalonModel.findById(selectedSalonId);
            if (!existingSalon) {
                return res.status(404).json({ error: "Selected salon does not exist" });
            }
            // assignedSalon is a field in User schema
            newUser.assignedSalon = selectedSalonId;
        }

        // 7) Save user
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Server error during registration." });
    }
});

/**
 * POST /api/auth/login
 * Authenticates a user by username + password. Returns a JWT token on success.
 */
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Validate input
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Username and password are required." });
        }

        // 2) Check if user exists
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // 3) Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // 4) Generate JWT
        const secret = process.env.JWT_SECRET || "change-me";
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            secret,
            { expiresIn: "1h" }
        );

        // 5) Return user + token
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

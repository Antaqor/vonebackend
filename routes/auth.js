require("dotenv").config();
const expressAuth = require("express");
const routerAuth = expressAuth.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Salon = require("../models/Salon");

// Register
routerAuth.post("/register", async (req, res) => {
    const {
        username,
        email,
        phoneNumber,
        password,
        // If no role is provided, default to 'owner' now
        role = "owner",

        // Additional fields for immediate salon creation (optional)
        salonName,
        salonLogo,
        categoryId,
    } = req.body;

    try {
        // 1) Check if user already exists
        const existing = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existing) {
            return res.status(400).json({ error: "Username/Email/Phone already in use" });
        }

        // 2) Create user with hashed password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashed,
            role,
        });
        await newUser.save();

        // 3) Optionally create a Salon immediately
        if (salonName) {
            const newSalon = new Salon({
                name: salonName,
                location: "Please update location",
                logo: salonLogo || "",
                category: categoryId || null,
                owner: newUser._id,
            });
            await newSalon.save();
        }

        // 4) Done! Return success
        return res
            .status(201)
            .json({ message: "User registered + Salon created (if data provided) successfully!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Login
routerAuth.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
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
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerAuth;
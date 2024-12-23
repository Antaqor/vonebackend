// routes/auth.js
// ===============================================================
require("dotenv").config();
const expressAuth = require("express");
const routerAuth = expressAuth.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
routerAuth.post("/register", async (req, res) => {
    const { username, email, phoneNumber, password, role } = req.body;
    try {
        const existing = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existing) {
            return res.status(400).json({ error: "Username/Email/Phone in use" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashed,
            role: role || "user",
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
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
        res.status(200).json({
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
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = routerAuth;
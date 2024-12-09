require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Registration Route
router.post('/register', async (req, res) => {
    const { username, email, phoneNumber, password } = req.body;  // Added email

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }]  // Added email check
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Username, Email, or Phone Number already in use' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Server error:', err); // Log the error for debugging
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Return user object (which contains the necessary fields)
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

module.exports = router;
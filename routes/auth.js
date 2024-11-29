const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user by username
router.get('/by-username/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            hasProfilePicture: !!user.profilePicture,
        });
    } catch (err) {
        console.error('Error fetching user by username:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get stylist by username
router.get('/stylist/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const stylist = await User.findOne({ username, role: 'stylist' });
        if (!stylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        res.status(200).json({ id: stylist._id });
    } catch (err) {
        console.error('Error fetching stylist:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
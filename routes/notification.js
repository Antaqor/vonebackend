import express from 'express';
import Notification from '../models/Notification.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('Error marking notifications as read:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
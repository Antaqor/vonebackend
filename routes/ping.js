// routes/ping.js

import express from 'express';
const router = express.Router();

// GET /api/ping
router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Pong! Backend is working.' });
});

export default router;
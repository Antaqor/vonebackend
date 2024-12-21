const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { serviceId, date, startTime, stylistId } = req.body;
        if (!serviceId || !date || !startTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const userId = req.user.id;
        const appt = new Appointment({
            user: userId,
            service: serviceId,
            stylist: stylistId || null,
            date: new Date(date),
            startTime,
            status: 'confirmed'
        });
        await appt.save();
        res.status(201).json({ message: 'Appointment booked successfully!', appointment: appt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// For dashboard: get appointments by service
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { serviceId } = req.query;
        if (!serviceId) return res.json([]);
        const appts = await Appointment.find({ service: serviceId })
            .populate('service')
            .populate('user', 'username')
            .populate('stylist', 'name');
        res.json(appts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
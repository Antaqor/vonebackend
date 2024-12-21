const express = require('express');
const router = express.Router();
const Salon = require('../models/Salon');
const authenticateToken = require('../middleware/authMiddleware');

// Create/Update Owner's Salon
router.post('/my-salon', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ error: 'Only owners' });
        const { name, location } = req.body;
        if (!name || !location) return res.status(400).json({ error: 'Missing name/location' });

        let salon = await Salon.findOne({ owner: req.user.id });
        if (salon) {
            // update
            salon.name = name;
            salon.location = location;
            await salon.save();
            res.status(200).json(salon);
        } else {
            // create
            const newSalon = new Salon({
                name,
                location,
                owner: req.user.id
            });
            await newSalon.save();
            res.status(201).json(newSalon);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get owner's salon
router.get('/my-salon', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ error: 'Only owners' });
        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: 'No salon found' });
        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Public routes
router.get('/', async (req, res) => {
    try {
        const salons = await Salon.find();
        res.json(salons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        res.json(salon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
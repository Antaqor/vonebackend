const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const authenticateToken = require('../middleware/authMiddleware');

// Create new service
router.post('/my-service', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ error: 'Only owners' });
        const { name, durationMinutes, price } = req.body;

        const salon = await Salon.findOne({ owner: req.user.id });
        if (!salon) return res.status(404).json({ error: 'No salon for this owner' });

        const newService = new Service({
            salon: salon._id,
            name,
            durationMinutes: durationMinutes || 30,
            price: price || 50,
            stylistTimeBlocks: []
        });
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add time block (morning, etc.)
router.post('/my-service/time-block', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'owner') return res.status(403).json({ error: 'Only owners' });

        const { serviceId, stylistId, label, times } = req.body;
        if (!serviceId || !label || !Array.isArray(times)) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const service = await Service.findById(serviceId).populate('salon');
        if (!service) return res.status(404).json({ error: 'Service not found' });
        if (String(service.salon.owner) !== req.user.id) {
            return res.status(403).json({ error: 'Not your salon' });
        }

        // Find or create a stylist block
        let foundBlock = service.stylistTimeBlocks.find(b => stylistId
            ? String(b.stylist) === String(stylistId)
            : !b.stylist
        );
        if (!foundBlock) {
            foundBlock = { stylist: stylistId || null, timeBlocks: [] };
            service.stylistTimeBlocks.push(foundBlock);
        }
        foundBlock.timeBlocks.push({ label, times });

        await service.save();
        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get services by salon
router.get('/salon/:salonId', async (req, res) => {
    try {
        const services = await Service.find({ salon: req.params.salonId });
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get single service
router.get('/:serviceId', async (req, res) => {
    try {
        const service = await Service.findById(req.params.serviceId).populate('salon');
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get availability
router.get('/:serviceId/availability', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Missing date' });

        const service = await Service.findById(serviceId)
            .populate({ path: 'stylistTimeBlocks.stylist', select: 'name' });
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Return stylistTimeBlocks array
        res.json(service.stylistTimeBlocks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
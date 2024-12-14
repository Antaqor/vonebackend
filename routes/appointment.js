import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import authenticateToken from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

const allowedServices = ["Үс засуулах", "Сормуус хийлгэх"];

// Create Appointment (User)
router.post('/', authenticateToken, async (req, res) => {
    const { service, stylistId, date, durationMinutes } = req.body;

    if (!service || !stylistId || !date || !durationMinutes) {
        return res.status(400).json({ error: 'All fields (service, stylistId, date, durationMinutes) are required.' });
    }

    if (!allowedServices.includes(service)) {
        return res.status(400).json({ error: 'Invalid service.' });
    }

    if (!mongoose.Types.ObjectId.isValid(stylistId)) {
        return res.status(400).json({ error: 'Invalid stylist ID format.' });
    }

    try {
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format.' });
        }

        const newAppointment = new Appointment({
            user: req.user.id,
            service,
            stylist: stylistId,
            date: appointmentDate,
            durationMinutes,
        });

        const savedAppointment = await newAppointment.save();

        // Notify stylist of new appointment
        await Notification.create({
            user: stylistId,
            message: `New appointment requested: ${service} on ${appointmentDate.toLocaleString()}`
        });

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: savedAppointment,
        });
    } catch (err) {
        console.error('Error creating appointment:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user.id })
            .populate('stylist', 'username')
            .sort({ date: 1 });
        res.status(200).json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/stylist/pending', authenticateToken, async (req, res) => {
    try {
        const stylist = await User.findById(req.user.id);
        if (!stylist || stylist.role !== 'stylist') {
            return res.status(403).json({ error: 'Access denied. Only stylists can view this.' });
        }

        const appointments = await Appointment.find({ stylist: req.user.id, status: 'pending' })
            .populate('user', 'username')
            .sort({ date: 1 });
        res.status(200).json(appointments);
    } catch (err) {
        console.error('Error fetching stylist appointments:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:appointmentId/decide', authenticateToken, async (req, res) => {
    const { appointmentId } = req.params;
    const { decision, newDate } = req.body;

    if (!decision || !['confirmed', 'canceled'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be either confirmed or canceled.' });
    }

    try {
        const stylist = await User.findById(req.user.id);
        if (!stylist || stylist.role !== 'stylist') {
            return res.status(403).json({ error: 'Access denied. Only stylists can confirm or cancel appointments.' });
        }

        const appointment = await Appointment.findOne({ _id: appointmentId, stylist: req.user.id });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found or not owned by this stylist.' });
        }

        if (decision === 'confirmed' && newDate) {
            const dateObj = new Date(newDate);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ error: 'Invalid newDate format.' });
            }
            appointment.date = dateObj;
        }

        appointment.status = decision;
        const updatedAppointment = await appointment.save();

        await Notification.create({
            user: appointment.user,
            message: `Your appointment has been ${decision} by the stylist.`
        });

        res.status(200).json({
            message: `Appointment ${decision === 'confirmed' ? 'approved (confirmed)' : 'canceled'} successfully`,
            appointment: updatedAppointment,
        });
    } catch (err) {
        console.error('Error updating appointment status:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
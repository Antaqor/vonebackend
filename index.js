// index.js

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import appointmentRoutes from './routes/appointment.js';
import notificationRoutes from './routes/notification.js';
import userRoutes from './routes/user.js';
import pingRoutes from './routes/ping.js'; // New Ping Route

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://206.189.80.118',
            'http://152.42.243.146:3000' // Add frontend's IP and port if different
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ping', pingRoutes); // Use Ping Route

// Root Endpoint
app.get('/', (req, res) => {
    res.status(200).send('Server is working!');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
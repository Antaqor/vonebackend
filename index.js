require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment Variable Checks
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
    console.error('Missing environment variables: JWT_SECRET or MONGODB_URI');
    process.exit(1);
}

// Middleware
const allowedOrigins = ['http://206.189.80.118', 'http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json()); // Parse JSON bodies

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Authentication routes

// Health Check Routes
app.get('/', (req, res) => res.status(200).send('Server is working! xD'));
app.get('/api', (req, res) => res.status(200).send('API endpoint is working! :)'));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database connection:', err.message);
    }
    process.exit(0);
});
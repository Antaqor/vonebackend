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
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://206.189.80.118', '206.189.80.118', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        console.log(`CORS request from origin: ${origin}`);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS error: Origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json()); // Parse JSON bodies

app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'Pong! Backend is working.' });
});

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
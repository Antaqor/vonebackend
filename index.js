require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for multiple origins
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://206.189.80.118'], // Allow multiple origins
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
        credentials: true, // Allow credentials like cookies
    })
);

// Middleware to parse JSON requests
app.use(express.json());

// Database connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit server if database connection fails
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Test route for server status
app.get('/', (req, res) => {
    res.status(200).send('Server is working!');
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
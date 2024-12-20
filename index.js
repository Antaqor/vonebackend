require('dotenv').config({ path: './server/.env' }); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://206.189.80.118' })); // Ensure the origin matches exactly with your frontend
app.use(express.json()); // To parse JSON bodies

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/auth', authRoutes); // Authentication routes

// Root Route to Check if the Server is Running
app.get('/', (req, res) => {
    res.send('Server is working!');
});

// API Root to Check if API is Accessible
app.get('/api', (req, res) => {
    res.send('API endpoint is working!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
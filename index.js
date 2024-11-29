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
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Database Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
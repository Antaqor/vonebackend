require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://152.42.243.146' })); // Update origin to match your server's IP
app.use(express.json()); // To parse JSON bodies

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit the process if the database connection fails
    }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Authentication routes

// Add a root route to check if the server is running
app.get('/', (req, res) => {
    res.status(200).send('Server is working!');
});

// Add a root route to check if the API is accessible
app.get('/api', (req, res) => {
    res.status(200).send('API endpoint is working!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown for Cleanup
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});
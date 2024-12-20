// server/index.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Define allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://206.189.80.118']; // Add your frontend URLs here

// Middleware
app.use(cors({
    origin: function(origin, callback){
        // Allow requests with no origin (like mobile apps or curl)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Allow cookies to be sent
}));
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
    res.send('Server is working im checking !');
});

// API Root to Check if API is Accessible
app.get('/api', (req, res) => {
    res.send('API endpoint is working!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
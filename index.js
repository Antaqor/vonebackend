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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/auth', authRoutes); // Original route

// Add a root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Add a root route to check if the API is accessible
app.get('/api', (req, res) => {
  res.send('API endpoint is working!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
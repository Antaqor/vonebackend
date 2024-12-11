// server/routes/auth.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();

// Set up Multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only JPEG and PNG images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
};

// Initialize Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter,
});

// --------------------
// Registration Route
// --------------------
router.post('/register', upload.single('profilePicture'), async (req, res) => {
    const { username, email, phoneNumber, password } = req.body;
    const profilePicture = req.file ? req.file.buffer : null; // Get the image buffer
    const profilePictureType = req.file ? req.file.mimetype : null; // Get the MIME type

    console.log('Received Registration Data:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Phone Number:', phoneNumber);
    console.log('Profile Picture Buffer Length:', profilePicture ? profilePicture.length : 0);
    console.log('Profile Picture MIME Type:', profilePictureType);
    console.log('req.file:', req.file);

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existingUser) {
            console.log('User already exists.');
            return res.status(400).json({ error: 'Username, Email, or Phone Number already in use' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            profilePicture, // Save the image buffer
            profilePictureType, // Save the MIME type
        });

        await newUser.save();
        console.log('User registered successfully:', newUser);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

// --------------------
// Login Route
// --------------------
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Received Login Data:');
    console.log('Username:', username);
    console.log('Password:', password);

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found.');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password does not match.');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return user object with profilePicture and token
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture ? `/api/auth/profile-picture/${user._id}` : '', // Endpoint to fetch image
            },
            token, // Include token if using JWT
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

// ----------------------------------------
// Endpoint to Retrieve Profile Pictures
// ----------------------------------------
router.get('/profile-picture/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user || !user.profilePicture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        // Set the correct Content-Type
        res.set('Content-Type', user.profilePictureType || 'image/jpeg');
        res.send(user.profilePicture); // Send the image buffer
    } catch (err) {
        console.error('Error fetching profile picture:', err);
        res.status(500).json({ error: 'Server error, please check logs for more details' });
    }
});

// ----------------------------------------
// Error Handling Middleware for Multer
// ----------------------------------------
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        console.error('Multer Error:', err.message);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // An unknown error occurred
        console.error('Unknown Error:', err.message);
        return res.status(400).json({ error: err.message });
    }

    // If no error, proceed to next middleware
    next();
});

export default router;